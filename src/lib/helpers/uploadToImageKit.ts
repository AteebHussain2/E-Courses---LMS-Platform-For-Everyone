import {
    ImageKitAbortError,
    ImageKitInvalidRequestError,
    ImageKitServerError,
    ImageKitUploadNetworkError,
    upload,
} from "@imagekit/next";

type Errors = {
    fileName: string,
    error: string,
}

/**
* Authenticates and retrieves the necessary upload credentials from the server.
*
* This function calls the authentication API endpoint to receive upload parameters like signature,
* expire time, token, and publicKey.
*
* @returns {Promise<{signature: string, expire: string, token: string, publicKey: string}>} The authentication parameters.
* @throws {Error} Throws an error if the authentication request fails.
*/
const authenticator = async () => {
    try {
        const response = await fetch("/api/upload-auth");
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Request failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const { signature, expire, token, publicKey } = data;
        return { signature, expire, token, publicKey };
    } catch (error) {
        console.error("Authentication error:", error);
        throw new Error("Authentication request failed");
    }
};

/**
* Handles the file upload process.
*
* This function:
* - Validates file selection.
* - Retrieves upload authentication credentials.
* - Initiates the file upload via the ImageKit SDK.
* - Updates the upload progress.
* - Catches and processes errors accordingly.
*/
const handleUpload = async (file: File) => {
    const abortController = new AbortController();

    if (!file) {
        throw new Error("Please select a file to upload");
    }

    let authParams;
    try {
        authParams = await authenticator();
    } catch (authError) {
        console.error("Failed to authenticate for upload:", authError);
        return;
    }
    const { signature, expire, token, publicKey } = authParams;

    try {
        const uploadResponse = await upload({
            // Authentication parameters
            expire,
            token,
            signature,
            publicKey,
            file,
            fileName: file.name, // Optionally set a custom file name
            // Abort signal to allow cancellation of the upload if needed.
            abortSignal: abortController.signal,
        });
        return uploadResponse;
    } catch (error) {
        // Handle specific error types provided by the ImageKit SDK.
        if (error instanceof ImageKitAbortError) {
            console.error("Upload aborted:", error.reason);
        } else if (error instanceof ImageKitInvalidRequestError) {
            console.error("Invalid request:", error.message);
        } else if (error instanceof ImageKitUploadNetworkError) {
            console.error("Network error:", error.message);
        } else if (error instanceof ImageKitServerError) {
            console.error("Server error:", error.message);
        } else {
            // Handle any other errors that may occur.
            console.error("Upload error:", error);
        }
    }
};

export const uploadToImageKit = async (files: File[]) => {
    if (!files || files.length === 0) {
        throw new Error("Please select a file to upload");
    }

    let imageUrls: string[] = [];
    let errors: Errors[] = [];

    for (const file of files) {
        const uploadResponse = await handleUpload(file)

        if (!uploadResponse || !uploadResponse?.url) {
            errors.push({ fileName: uploadResponse?.name || '', error: uploadResponse?.message || '' })
            continue

        }
        imageUrls.push(uploadResponse?.url)
    }

    return { imageUrls, errors }
};
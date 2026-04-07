"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloudIcon } from "lucide-react";
import { FieldError } from "../ui/field";
import React, { useRef } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

type FileUploadProps = React.ComponentProps<"input"> & {
    title?: string
    onFilesChange?: (files: File[]) => void
    files?: File[]
    existingUrls?: string[],
    // size?: 'lg' | 'sm' | 'default'
}

export default function FileUpload({ onFilesChange, files = [], title, existingUrls = [], value, ...props }: FileUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { "aria-invalid": invalid, "aria-errormessage": error, ref, onChange, ...rest } = props;

    const mergedRef = React.useCallback((node: HTMLInputElement | null) => {
        (fileInputRef as React.RefObject<HTMLInputElement | null>).current = node;
        if (typeof ref === 'function') {
            ref(node);
        } else if (ref) {
            (ref as React.RefObject<HTMLInputElement | null>).current = node;
        }
    }, [ref]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const incoming = Array.from(e.target.files)
            onFilesChange?.(incoming)
        }
        props.onChange?.(e)
    }

    const handleDelete = (index: number) => {
        const updated = files.filter((_, i) => i !== index)
        onFilesChange?.(updated)
    }

    const handleChange = () => {
        fileInputRef.current?.click()
    }

    return (
        <Card className="p-0! rounded-xl gap-3!">
            {title && (
                <CardHeader className="px-5! pt-3.75!">
                    <CardTitle className="text-text text-[1rem] font-semibold">
                        {title}
                    </CardTitle>
                </CardHeader>
            )}

            <CardContent className="p-5! pt-0! border-none!">
                {/* Dropzone UI */}
                <div className="overflow-clip border-2 border-dashed border-border rounded-xl relative">
                    <input
                        type="file"
                        ref={mergedRef}
                        className="hidden"
                        onChange={handleFileChange}
                        {...rest}
                    />

                    {(files.length < 0 || existingUrls?.length < 0) ? (
                        <div
                            className={cn("overflow-clip flex flex-col items-center justify-center py-10 bg-background-secondary cursor-pointer transition-all hover:bg-background-secondary/90",
                                uploadVariants['default']
                            )}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <UploadCloudIcon className="w-12 h-12 text-primary" />
                            <h3 className="mt-4 text-2xl font-medium text-text">
                                Drop your image(s) here, or{" "}
                                <span className="text-primary font-medium">click to browse</span>
                            </h3>
                            <span className="text-text-muted font-normal text-[13px] mt-1">
                                1600×1200 (4:3) recommended. PNG, JPG, GIF files are allowed.
                            </span>
                        </div>
                    ) : files.length > 0 ? (
                        <>
                            <Image
                                src={URL.createObjectURL(files[0])}
                                alt={files[0].name}
                                width={250}
                                height={180}
                                className="w-full h-full aspect-video object-cover"
                            />

                            <Button
                                type="button"
                                size="sm"
                                className="hover:cursor-pointer bg-destructive text-white hover:bg-destructive hover:text-white text-xs rounded-[3px] absolute top-2 right-2"
                                onClick={() => handleDelete(0)}
                            >
                                Delete
                            </Button>
                        </>
                    ) : (
                        <>
                            <Image
                                src={existingUrls[0]}
                                alt={existingUrls[0]}
                                width={427}
                                height={240}
                                className="w-full h-full aspect-auto object-cover"
                            />

                            <Button
                                type="button"
                                size="sm"
                                className="hover:cursor-pointer bg-destructive text-white hover:bg-destructive hover:text-white text-xs rounded-[3px] absolute top-2 right-2"
                                onClick={handleChange}
                            >
                                Change
                            </Button>
                        </>
                    )}
                </div>

                {/* File Preview List */}
                <ul className="list-none mt-5 space-y-3 hidden">
                    {files.length !== 0 ? files.map((file, index) => (
                        <li
                            key={index}
                            className="border border-border rounded-xl overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-2 gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded bg-muted flex items-center justify-center overflow-hidden">
                                        <Image
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            width={48}
                                            height={48}
                                            className="object-cover rounded size-full"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white truncate max-w-45">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-muted">
                                            {(file.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    className="bg-[#e96767]/10 hover:bg-destructive text-destructive hover:text-white text-xs rounded-[3px]"
                                    onClick={() => handleDelete(index)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </li>
                    )) : existingUrls && existingUrls?.map((url, index) => (
                        <li
                            key={index}
                            className="border border-border rounded-xl overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-2 gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded bg-muted flex items-center justify-center overflow-hidden">
                                        <Image
                                            src={url}
                                            alt={url}
                                            width={48}
                                            height={48}
                                            className="object-cover rounded size-full"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white truncate max-w-sm">
                                            This is the current course image.
                                        </p>
                                        <p className="text-xs text-muted">
                                            Drop or click to change image.
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    className="bg-[#e96767]/10 hover:bg-destructive text-destructive hover:text-white text-xs rounded-[3px]"
                                    onClick={handleChange}
                                >
                                    Change
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
                {invalid && (
                    <FieldError errors={[{ message: error }]} className="mt-2! ml-1" />
                )}
            </CardContent>
        </Card >
    )
}

const uploadVariants = {
    default: 'min-h-65',
    lg: 'min-h-85',
    sm: ''
};

// if (false) {
//     return (
//         <Card className="p-0! rounded-xl">
//             {title && (
//                 <CardHeader className="px-5! pt-3.75!">
//                     <CardTitle className="text-text text-[1rem] font-semibold">
//                         {title}
//                     </CardTitle>
//                 </CardHeader>
//             )}

//             <CardContent className="p-5! pt-0! border-none!">
//                 {/* Dropzone UI */}
//                 <div
//                     className={cn("relative flex-col items-center justify-center border-2 border-dashed border-border rounded-xl py-10 bg-background-secondary cursor-pointer transition-all hover:bg-background-secondary/90",
//                         uploadVariants['sm'],
//                         files.length !== 0 ? 'hidden' : 'flex'
//                     )}
//                     onClick={() => fileInputRef.current?.click()}
//                 >
//                     <input
//                         type="file"
//                         ref={fileInputRef}
//                         className="hidden"
//                         onChange={handleFileChange}
//                         {...props}
//                     />
//                     <h3 className="mt-4 text-lg font-medium text-text">
//                         Drop your image(s) here, or{" "}
//                         <span className="text-primary font-medium">click to browse</span>
//                     </h3>
//                     <span className="text-text-muted font-normal text-xs mt-1">
//                         1600×1200 (4:3) recommended. PNG, JPG, WEBP files are allowed.
//                     </span>
//                 </div>

//                 {/* File Preview List */}
//                 {files.length > 0 && (
//                     <ul className="list-none space-y-3">
//                         {files.map((file, index) => (
//                             <li
//                                 key={index}
//                                 className="max-w-sm flex flex-col items-center gap-3 relative border border-border p-2 rounded-md"
//                             >
//                                 <div className="backdrop-blur-2xl top-0 left-0 right-0 w-full flex items-center justify-between gap-3">
//                                     <div>
//                                         <p className="text-sm font-medium text-white truncate max-w-45">
//                                             {file.name}
//                                         </p>
//                                         <p className="text-xs text-text-muted">
//                                             {(file.size / 1024).toFixed(1)} KB
//                                         </p>
//                                     </div>
//                                     <Button
//                                         size="sm"
//                                         className="cursor-pointer bg-[#e96767]/10 hover:bg-destructive text-destructive hover:text-white text-xs rounded-[3px]"
//                                         onClick={() => handleDelete(index)}
//                                     >
//                                         Delete
//                                     </Button>
//                                 </div>
//                                 <div className="w-full aspect-video rounded bg-muted flex items-center justify-center overflow-hidden">
//                                     <Image
//                                         src={URL.createObjectURL(file)}
//                                         alt={file.name}
//                                         width={48}
//                                         height={48}
//                                         className="object-cover rounded size-full"
//                                     />
//                                 </div>
//                             </li>
//                         ))}
//                     </ul>
//                 )}
//             </CardContent>
//         </Card>
//     )
// }
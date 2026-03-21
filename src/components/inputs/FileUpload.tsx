"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloudIcon } from "lucide-react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

type FileUploadProps = {
    title?: string
    mode?: 'single' | 'multiple'
    size?: 'lg' | 'sm' | 'default'
}

export default function FileUpload({ title, mode = 'single', size = 'default' }: FileUploadProps) {
    const [files, setFiles] = useState<File[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files))
        }
    }

    const handleDelete = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index))
    }

    if (size === 'sm') {
        return (
            <Card className="p-0! rounded-xl">
                {title && (
                    <CardHeader className="px-5! pt-3.75!">
                        <CardTitle className="text-text text-[1rem] font-semibold">
                            {title}
                        </CardTitle>
                    </CardHeader>
                )}

                <CardContent className="p-5! pt-0! border-none!">
                    {/* Dropzone UI */}
                    <div
                        className={cn("relative flex-col items-center justify-center border-2 border-dashed border-border rounded-xl py-10 bg-background-secondary cursor-pointer transition-all hover:bg-background-secondary/90",
                            uploadVariants[size],
                            files.length !== 0 ? 'hidden' : 'flex'
                        )}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {mode == 'multiple' ? (
                            <input
                                type="file"
                                multiple={true}
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        ) : (
                            <input
                                type="file"
                                multiple={false}
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        )}
                        <h3 className="mt-4 text-lg font-medium text-text">
                            Drop your image{mode === 'multiple' && 's'} here, or{" "}
                            <span className="text-primary font-medium">click to browse</span>
                        </h3>
                        <span className="text-text-muted font-normal text-xs mt-1">
                            1600×1200 (4:3) recommended. PNG, JPG, WEBP files are allowed.
                        </span>
                    </div>

                    {/* File Preview List */}
                    {files.length > 0 && (
                        <ul className="list-none space-y-3">
                            {files.map((file, index) => (
                                <li
                                    key={index}
                                    className="max-w-sm flex flex-col items-center gap-3 relative border border-border p-2 rounded-md"
                                >
                                    <div className="backdrop-blur-2xl top-0 left-0 right-0 w-full flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-medium text-white truncate max-w-45">
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-text-muted">
                                                {(file.size / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="cursor-pointer bg-[#e96767]/10 hover:bg-destructive text-destructive hover:text-white text-xs rounded-[3px]"
                                            onClick={() => handleDelete(index)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                    <div className="w-full aspect-video rounded bg-muted flex items-center justify-center overflow-hidden">
                                        <Image
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            width={48}
                                            height={48}
                                            className="object-cover rounded size-full"
                                        />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="p-0! rounded-xl">
            {title && (
                <CardHeader className="px-5! pt-3.75!">
                    <CardTitle className="text-text text-[1rem] font-semibold">
                        {title}
                    </CardTitle>
                </CardHeader>
            )}

            <CardContent className="p-5! pt-0! border-none!">
                {/* Dropzone UI */}
                <div
                    className={cn("relative flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl py-10 bg-background-secondary cursor-pointer transition-all hover:bg-background-secondary/90",
                        uploadVariants[size]
                    )}
                    onClick={() => fileInputRef.current?.click()}
                >
                    {mode == 'multiple' ? (
                        <input
                            type="file"
                            multiple={true}
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    ) : (
                        <input
                            type="file"
                            multiple={false}
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    )}
                    {size === 'default' && <>
                        <UploadCloudIcon className="w-12 h-12 text-primary" />
                        <h3 className="mt-4 text-2xl font-medium text-text">
                            Drop your image{mode === 'multiple' && 's'} here, or{" "}
                            <span className="text-primary font-medium">click to browse</span>
                        </h3>
                        <span className="text-text-muted font-normal text-[13px] mt-1">
                            1600×1200 (4:3) recommended. PNG, JPG, GIF files are allowed.
                        </span>
                    </>}
                    {size === 'lg' && <>
                        <UploadCloudIcon className="w-12 h-12 text-primary" />
                        <h3 className="mt-4 text-2xl font-medium text-text">
                            Drop your image{mode === 'multiple' && 's'} here, or{" "}
                            <span className="text-primary font-medium">click to browse</span>
                        </h3>
                        <span className="text-text-muted font-normal text-[13px] mt-1">
                            1600×1200 (4:3) recommended. PNG, JPG, WEBP files are allowed.
                        </span>
                    </>}
                </div>

                {/* File Preview List */}
                {files.length > 0 && (
                    <ul className="list-none mt-5 space-y-3">
                        {files.map((file, index) => (
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
                                            <p className="text-xs text-text-muted">
                                                {(file.size / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="bg-[#e96767]/10 hover:bg-[#e96767] text-[#e96767] hover:text-clean-white text-xs rounded-[3px]"
                                        onClick={() => handleDelete(index)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    )
}

const uploadVariants = {
    default: 'min-h-65',
    lg: 'min-h-85',
    sm: ''
};
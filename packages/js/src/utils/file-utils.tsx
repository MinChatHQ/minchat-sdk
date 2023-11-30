import { AltFile, File } from "../types/file";

type FileResponse = {
    file: any
    name?: string
    size?: string
    type: "file" | "gif" | "image" | "video"
}

export const prepareFileForUpload = (file: File | AltFile | undefined): FileResponse | undefined => {

    if (!file) return undefined

    let processedFile: {
        name?: string,
        type?: string,
        buffer?: any
    } | undefined = undefined


    processedFile = {
        name: file?.name,
        type: file?.type,
        buffer: null
    }

    if ('blob' in file) {
        const data = new FormData();

        data.append('file', file.blob);

        processedFile.buffer = data

    } else if ('stream' in file) {
        processedFile.buffer = file
    }

    return {
        file: processedFile,
        type: convertMimeType(processedFile?.type),
        size: formatFileSize(processedFile?.buffer),
        name: processedFile.name
    }

}


function convertMimeType(mimeType?: string) {

    if (mimeType && mimeType.startsWith('image/')) {
        if (mimeType.endsWith('gif')) {
            return 'gif';
        } else {
            return 'image';
        }
    } else if (mimeType && mimeType.startsWith('video/')) {
        return 'video';
    } else {
        return 'file';
    }
}


function formatFileSize(bytes: any) {
    if (isNaN(bytes)) {
        return undefined;
    }


    const kb = bytes / 1024;
    if (kb < 1024) {
        return kb.toFixed(2) + ' KB';
    } else {
        return (kb / 1024).toFixed(2) + ' MB';
    }
}
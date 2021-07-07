import * as theia from "@theia/plugin";

export abstract class FileSystemAdaptor {

    /**
     * @description Calculates the size of the document associated with the uri passed in
     * @param uri The uri
     * @returns The file size
     */
    public static async getFileSize(uri: theia.Uri, untitledDocumentData?: Uint8Array): Promise<number> {
        if (uri.scheme === "untitled") {
            return untitledDocumentData?.length ?? 0;
        } else {
            return (await theia.workspace.fs.stat(uri)).size;
        }
    }

    public static async readFile(uri: theia.Uri, untitledDocumentData?: Uint8Array): Promise<Uint8Array> {
        // console.log(uri);
        if (uri.scheme === "untitled") {
            // We have the bytes so we return them
            return untitledDocumentData ?? new Uint8Array();
        } else {
            return theia.workspace.fs.readFile(uri);
        }
    }
}

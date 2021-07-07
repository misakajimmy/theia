import { Uri } from "@theia/plugin";
import { FileSystemAdaptor } from "./fileSystemAdaptor";

const FirmwareHeader: Uint8Array = new Uint8Array([223, 173, 190, 239]);
const textDecoder: TextDecoder = new TextDecoder();
const FileHeaderStarter = {
    FileName: 32,
    FileIndex: 36,
    FileSize: 40,
    BurnAddr: 44,
    BurnSize: 48,
    Type: 52,
}
const arrayEqual = (first: Uint8Array, second: Uint8Array) =>
    first.length === second.length && first.every((value, index) => value === second[index]);

export class File {
    fileName: string;
    fileIndex: number;
    fileSize: number;
    burnAddr: number;
    burnSize: number;
    type: number;
    fileData: Uint8Array;

    constructor(
        fileName: string,
        fileIndex: number,
        fileSize: number,
        burnAddr: number,
        burnSize: number,
        type: number,
        fileData: Uint8Array,
    ) {
        this.fileName = fileName;
        this.fileIndex = fileIndex;
        this.fileSize = fileSize;
        this.burnAddr = burnAddr;
        this.burnSize = burnSize;
        this.type = type;
        this.fileData = fileData;
    }
}

export class Firmware {
    private readonly _uri: Uri;

    private _fileSize?: number;
    private _fileData?: Uint8Array;
    private _fileNum?: number;
    files?: File[];

    constructor(
        uri: Uri,
    ) {
        this._uri = uri;
    }

    public async readFile() {
        this.files = []
        this._fileData = await FileSystemAdaptor.readFile(this._uri);
        this._fileSize = await FileSystemAdaptor.getFileSize(this._uri);
        console.log(this._fileSize);
        await this.decodeBin()
    }

    private decodeBuffer2Num(data: Uint8Array): number {
        let num = 0;
        for (let i = 0; i < data.byteLength; i++) {
            num = num << 8 | data[i];
        }
        return num;
    }

    private async decodeBin() {
        if (this?._fileData) {
            if (arrayEqual(this._fileData.subarray(0, 4), FirmwareHeader)) {
                this._fileNum = this._fileData[6];
                for (let i = 0; i < this._fileNum; i++) {
                    let fileHeaderStart = i * 52 + 12;
                    let fileName = textDecoder.decode(
                        this._fileData.subarray(fileHeaderStart, fileHeaderStart + FileHeaderStarter.FileName)
                            .filter((data) => {
                                return data !== 0x00;
                            })
                    );
                    let fileIndex = this.decodeBuffer2Num(this._fileData.subarray(fileHeaderStart + FileHeaderStarter.FileName, fileHeaderStart + FileHeaderStarter.FileIndex).reverse());
                    let fileSize = this.decodeBuffer2Num(this._fileData.subarray(fileHeaderStart + FileHeaderStarter.FileIndex, fileHeaderStart + FileHeaderStarter.FileSize).reverse());
                    let burnAddr = this.decodeBuffer2Num(this._fileData.subarray(fileHeaderStart + FileHeaderStarter.FileSize, fileHeaderStart + FileHeaderStarter.BurnAddr).reverse());
                    let burnSize = this.decodeBuffer2Num(this._fileData.subarray(fileHeaderStart + FileHeaderStarter.BurnAddr, fileHeaderStart + FileHeaderStarter.BurnSize).reverse());
                    let type = this.decodeBuffer2Num(this._fileData.subarray(fileHeaderStart + FileHeaderStarter.BurnSize, fileHeaderStart + FileHeaderStarter.Type).reverse());

                    let fileData = this._fileData.subarray(fileIndex, fileIndex + fileSize);

                    let file = new File(
                        fileName,
                        fileIndex,
                        fileSize,
                        burnAddr,
                        burnSize,
                        type,
                        fileData
                    );
                    this.files?.push(file);
                }
            }
        }
    }
}

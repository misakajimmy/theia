import { Uri } from "@theia/plugin";
import { webserial, dialog } from "@wm/plugin";
import { File, Firmware } from "./firmware";
import { Ymodem } from "./ymodem";

export namespace Burn {
    export const START_FLAG: Uint8Array = new Uint8Array([0xEF, 0xBE, 0xAD, 0xDE]);

    export interface Frame {
        Start_flag: Uint8Array;
        Packet_size: Uint8Array;
        Frame_type: Uint8Array;
        Frame_type_reverse: Uint8Array;
        Data: Uint8Array;
        Check_sum?: Uint8Array;
    }

    export enum FrameType {
        Shake_hands_frame = 240,
        ACK_frame = 225,
        Command_Download_FLASH_image = 210,
        Command_Download_OTP = 195,
        Command_Upload_data = 180,
        Command_Read_OTP = 165,
        Command_Flash_Protection = 150,
        Command_Reset = 135,
        Command_Download_Factory_bin = 120,
        Command_Download_Version = 105,
        Command_Download_NVKV_configuration = 75,
    }

    export enum readMode {
        NONE,
        BURN_ACK,
        YMODEM_START,
        YMODEM,
    }

    export const ACK_FRAME: number[] = [239, 190, 173, 222, 12, 0, 225, 30, 90, 66, 19, 74];
    export const YMODEM_START_ACK: number[] = [67];
    export const YMODEM_START_ACK_255: number[] = [255];
    export const YMODEM_ACK: number[] = [6];
}

const dataChannel = "waffle-nano-burn";

export class Hiburn {
    private readData: any;
    private readMode: Burn.readMode;
    private readOkFlag: boolean;
    private breakFlag: boolean;
    actionLock: boolean = false;
    private ymodem: Ymodem;

    constructor() {
        this.readMode = Burn.readMode.NONE;
        this.readOkFlag = true;
        this.breakFlag = false;
        this.actionLock = false;
        this.ymodem = new Ymodem();
    }

    private static checkSubList(l1: number[], l2: number[]): boolean {
        return !!~l2.join('').indexOf(l1.join(''));
    }

    private async startReadData() {
        await webserial.clearData(dataChannel);
        this.readData = setInterval(async () => {
            let data = await webserial.onData(dataChannel) as any;
            if (data.length > 0) {
                let dataList: number[] = [];
                for (let values of data) {
                    dataList = dataList.concat(Object.values(values));
                }
                // console.log(this.readMode);
                // console.log(dataList);
                switch (this.readMode) {
                    case Burn.readMode.NONE:
                        break;
                    case Burn.readMode.BURN_ACK:
                        if (Hiburn.checkSubList(Burn.ACK_FRAME, dataList)) {
                            this.readOkFlag = true;
                        }
                        break;
                    case Burn.readMode.YMODEM_START:
                        if (Burn.YMODEM_START_ACK[0] === dataList[0]) {
                            this.readOkFlag = true;
                        }
                        break;
                    case Burn.readMode.YMODEM:
                        if (Burn.YMODEM_ACK[0] === dataList[0]) {
                            this.readOkFlag = true;
                        }
                        break;
                    default:
                        break;
                }
            }
        }, 40);
    }

    private async stopReadData() {
        clearInterval(this.readData);
    }

    protected crc16_xmodem(data: Uint8Array): Uint8Array {
        let crc = 0x00;
        for (let index = 0; index < data.byteLength; index++) {
            const byte = data[index];
            let code = (crc >>> 8) & 0xff;

            code ^= byte & 0xff;
            code ^= code >>> 4;
            crc = (crc << 8) & 0xffff;
            crc ^= code;
            code = (code << 5) & 0xffff;
            crc ^= code;
            code = (code << 7) & 0xffff;
            crc ^= code;
        }

        return new Uint8Array([crc >> 8, crc & 0xFF]);
    }

    protected reverseUint8(data: number): number {
        return ((data & 0x01) << 7) | ((data & 0x02) << 5) | ((data & 0x04) << 3) | ((data & 0x08) << 1) |
            ((data & 0x10) >> 1) | ((data & 0x20) >> 3) | ((data & 0x40) >> 5) | ((data & 0x80) >> 7);
    }

    private frame2Uint8(frame: Burn.Frame): Uint8Array {
        let frameNoCrc = new Uint8Array(frame.Data.byteLength + 8);
        frameNoCrc.set(frame.Start_flag, 0);
        frameNoCrc.set(frame.Packet_size, 4);
        frameNoCrc.set(frame.Frame_type, 6);
        frameNoCrc.set(frame.Frame_type_reverse, 7);
        frameNoCrc.set(frame.Data, 8);
        let crc = this.crc16_xmodem(frameNoCrc).reverse();
        let frameWithCrc = new Uint8Array(frameNoCrc.byteLength + 2);
        frameWithCrc.set(frameNoCrc, 0);
        frameWithCrc.set(crc, frameNoCrc.byteLength);
        return frameWithCrc;
    }

    private generateFrame(frameType: Burn.FrameType, data: Uint8Array): Uint8Array {
        let frameLength = data.byteLength + 10;
        let frame: Burn.Frame = {
            Start_flag: Burn.START_FLAG,
            Packet_size: new Uint8Array([frameLength >> 8, frameLength & 0xff]).reverse(),
            Frame_type: new Uint8Array([frameType]),
            Frame_type_reverse: new Uint8Array([this.reverseUint8(frameType)]),
            Data: data,
        };
        return this.frame2Uint8(frame);
    }

    private async sleep(time: number) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

    private async requestUpload(fileAddr: number, fileLength: number, eraseSize: number) {
        let data = [
            fileAddr & 0xFF,
            (fileAddr >> 8) & 0xFF,
            (fileAddr >> 16) & 0xFF,
            (fileAddr >> 24) & 0xFF,
            fileLength & 0xFF,
            (fileLength >> 8) & 0xFF,
            (fileLength >> 16) & 0xFF,
            (fileLength >> 24) & 0xFF,
            eraseSize & 0xFF,
            (eraseSize >> 8) & 0xFF,
            (eraseSize >> 16) & 0xFF,
            (eraseSize >> 24) & 0xFF,
            0x00,
            0xFF,
        ];
        let frame = this.generateFrame(Burn.FrameType.Command_Download_FLASH_image, new Uint8Array(data));
        this.readOkFlag = false;
        this.readMode = Burn.readMode.YMODEM_START;
        await webserial.writeListData(Array.from(frame));
        while (!this.readOkFlag) {
            await this.sleep(40);
        }
    }

    private async sendReboot() {
        let data = [0x00, 0x00];
        let frame = this.generateFrame(Burn.FrameType.Command_Reset, new Uint8Array(data));
        await webserial.writeListData(Array.from(frame));
    }

    private async sendFile(file: File) {
        if (!this.breakFlag) {
            this.readMode = Burn.readMode.YMODEM_START;
            this.readOkFlag = false;
            while (!this.readOkFlag && !this.breakFlag) {
                await this.sleep(40);
            }
        }

        if (!this.breakFlag) {
            this.readMode = Burn.readMode.YMODEM;
            let header = this.ymodem.generateHeader(file.fileName, file.fileSize);
            this.readOkFlag = false;
            await webserial.writeListData(Array.from(header));
            while (!this.readOkFlag && !this.breakFlag) {
                await this.sleep(40);
            }
        }

        let datas = this.ymodem.generateBody(file.fileData);
        for (let i in datas) {
            dialog.processBar.setPercent(Number(i) / datas.length);
            if (this.breakFlag) {
                break;
            }
            this.readOkFlag = false;
            await webserial.writeListData(Array.from(datas[i]));
            while (!this.readOkFlag && !this.breakFlag) {
                await this.sleep(40);
            }
        }

        if (!this.breakFlag) {
            let data = this.ymodem.generateEnd();
            this.readOkFlag = false;
            await webserial.writeListData([0x04]);
            await webserial.writeListData(Array.from(data));
            while (!this.readOkFlag && !this.breakFlag) {
                await this.sleep(40);
            }
        }
    }

    private async startLoader(baudRate: number) {
        console.log(baudRate);
        let data = [
            // 115200
            baudRate & 0xff,
            (baudRate >> 8) & 0xff,
            (baudRate >> 16) & 0xff,
            (baudRate >> 24) & 0xff,
            0x08,
            0x01,
            0x00,
            0x00,
        ];
        this.readOkFlag = false;
        this.readMode = Burn.readMode.BURN_ACK;
        let frame = this.generateFrame(Burn.FrameType.Shake_hands_frame, new Uint8Array(data));
        while (!this.readOkFlag && !this.breakFlag) {
            await webserial.writeListData(Array.from(frame));
            await this.sleep(2);
        }
        this.readMode = Burn.readMode.NONE;
    }

    private async reconnect(baudRate: number) {
        await webserial.disconnect();
        await this.sleep(1000);
        await webserial.openSerialPort({
            baudRate: baudRate,
            dataBits: 8,
            stopBits: 1,
            parity: "none",
            bufferSize: 2048,
            flowControl: "none",
        });
    }

    public async uploadFirmware(uri: Uri, baudRate?: number) {
        let firmware = new Firmware(uri);
        await firmware.readFile();

        if (firmware?.files) {
            await this.startReadData();

            for (let i in firmware.files) {
                switch (firmware.files[i].type) {
                    case 0:
                        dialog.message.open();
                        dialog.message.setContent("Please reboot your waffle");
                        dialog.message.closeButtom();
                        await this.startLoader(baudRate === undefined ? 115200 : baudRate);
                        await this.reconnect(baudRate === undefined ? 115200 : baudRate);
                        dialog.message.close();
                        dialog.processBar.open("nyan");
                        dialog.processBar.removeCloseButtom();
                        dialog.processBar.setTitle("Burning");
                        break;
                    case 1:
                        await this.requestUpload(
                            firmware.files[i].burnAddr,
                            firmware.files[i].fileSize,
                            firmware.files[i].burnSize,
                        );
                        break;
                    default:
                        break;
                }
                if (!this.breakFlag) {
                    await this.sendFile(firmware.files[i]);
                }
            }
            dialog.processBar.close();
            await this.sendReboot();
            await this.reconnect(115200);
            await this.stopReadData();
        }
    }

    public setBreak() {
        if (!this.breakFlag) {
            this.breakFlag = true;
        }
    }
}

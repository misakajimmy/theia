const START = {
    SOH: 0x01,
    STX: 0x02,
}
const encoder = new TextEncoder();

interface Frame {
    Start: number,
    PacketNum: number,
    RPacketNum: number,
    Data: Uint8Array,
    Crc: Uint8Array,
}

export class Ymodem {
    private crc16_xmodem(data: Uint8Array): Uint8Array {
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

    private frame2Buffer(frame: Frame): Uint8Array {
        return new Uint8Array([
            frame.Start,
            frame.PacketNum,
            frame.RPacketNum,
            ...frame.Data,
            ...frame.Crc,
        ]);
    }

    public generateHeader(name: string, size: number): Uint8Array {
        let nameBuffer: Uint8Array = encoder.encode(name);
        let sizeBuffer: Uint8Array = encoder.encode(size.toString());
        let zeroBuffer: Uint8Array = new Uint8Array(128 - nameBuffer.length - sizeBuffer.length - 1);
        let data = new Uint8Array([
            ...nameBuffer,
            0x00,
            ...sizeBuffer,
            ...zeroBuffer,
        ])
        let frame: Frame = {
            Start: START.SOH,
            PacketNum: 0x00,
            RPacketNum: 0xFF,
            Data: data,
            Crc: this.crc16_xmodem(data)
        };
        return this.frame2Buffer(frame);
    }

    public generateBody(file: Uint8Array): Uint8Array[] {
        let datas: Uint8Array[] = [];
        let length = file.length;
        let dataLength = Math.floor(length / 1024);
        for (let i = 0; i < dataLength; i++) {
            let data = file.subarray(i * 1024, (i + 1) * 1024);
            let frame: Frame = {
                Start: START.STX,
                PacketNum: i + 1,
                RPacketNum: 254 - i,
                Data: data,
                Crc: this.crc16_xmodem(data)
            }
            datas.push(this.frame2Buffer(frame));
        }
        let dataBuffer = file.subarray(dataLength * 1024, length);
        let zeroBuffer: Uint8Array = new Uint8Array(1024 - dataBuffer.length);
        let data = new Uint8Array([
            ...dataBuffer,
            ...zeroBuffer,
        ]);
        let frame: Frame = {
            Start: START.STX,
            PacketNum: dataLength + 1,
            RPacketNum: 254 - dataLength,
            Data: data,
            Crc: this.crc16_xmodem(data),
        }
        datas.push(this.frame2Buffer(frame));
        return datas;
    }

    public generateEnd(): Uint8Array {
        let data: Uint8Array = new Uint8Array(128);
        let frame: Frame = {
            Start: START.SOH,
            PacketNum: 0x00,
            RPacketNum: 0xFF,
            Data: data,
            Crc: this.crc16_xmodem(data),
        };
        return this.frame2Buffer(frame);
    }
}

import {injectable} from 'inversify';
// @ts-ignore
import {Promise} from "bluebird";

export interface SerialOptions {
    baudRate?: number;
    dataBits?: number;
    stopBits?: number;
    parity?: ParityType;
    bufferSize?: number;
    flowControl?: FlowControlType;
}

enum ParityType {
    "none" = "none",
    "even" = "even",
    "odd" = "odd"
}

enum FlowControlType {
    "none" = "none",
    "hardware" = "hardware"
}

export interface SerialPortInfo {
    id?: string;
    displayName?: string;
    usbVendorId: number;
    usbProductId: number;
}

export interface SerialInputSignals {
    dataCarrierDetect?: boolean;
    clearToSend?: boolean;
    ringIndicator?: boolean;
    dataSetReady?: boolean;
}

export interface SerialOutputSignals {
    dataTerminalReady?: boolean;
    requestToSend?: boolean;
    break?: boolean;
}

export interface SerialPort {
    readable: ReadableStream;

    writable: WritableStream;

    getInfo(): SerialPortInfo;

    open(options: SerialOptions): Promise<void>;

    setSignals(signals: SerialOutputSignals): Promise<void>;

    getSignals(): Promise<SerialInputSignals>;

    close(): Promise<void>;
}

export interface IOStreams {
    channel: string[];
    streams: { [key: string]: ReadableStream };
    reader: { [key: string]: ReadableStreamDefaultReader };
    controller: { [key: string]: ReadableStreamController<any> };
}

export interface SerialPortFilter {
    usbVendorId?: number;
    usbProductId?: number;
}

@injectable()
export class WebSerialsControl {
    private port?: SerialPort;
    private readable?: ReadableStream;
    private writable?: WritableStream;
    private reader?: ReadableStreamDefaultReader;
    private writer?: WritableStreamDefaultWriter;
    private encoder = new TextEncoder();
    private iostreams: IOStreams;

    public access: boolean = false;

    serialOptions: SerialOptions = {
        baudRate: 115200,
        dataBits: 8,
        stopBits: 1,
        parity: ParityType.none,
        bufferSize: 2048,
        flowControl: FlowControlType.none
    };

    constructor() {
        this.iostreams = {
            channel: [],
            streams: {},
            reader: {},
            controller: {},
        }
        this.iostreams.channel = ["main", "plugin"];
        this.recreateStreams();
    }

    private async syncReadData() {
        let loop = async () => {
            if (this?.reader && this.access) {
                try {
                    await this.reader.read().then(({done, value}) => {
                        if (done) {
                            return;
                        }
                        for (let channel of this.iostreams.channel) {
                            this.iostreams.controller[channel].enqueue(value);
                        }
                    });
                } catch (e) {
                    console.log(e);
                    Promise.delay(100).then(loop);
                } finally {
                    Promise.delay(20).then(loop);
                }
            }
        };
        loop();
    }

    private forkReadableStream(channel: string): ReadableStream {
        let iostreams = this.iostreams;
        return new ReadableStream({
            start(controller) {
                iostreams.controller[channel] = controller;
            }
        });
    }

    private recreateStreams() {
        for (let channel of this.iostreams.channel) {
            this.iostreams.streams[channel] = this.forkReadableStream(channel);
            this.iostreams.reader[channel] = this.iostreams.streams[channel].getReader();
        }
    }

    public async requestPort(filters?: SerialPortFilter[]): Promise<boolean> {
        try {
            this.port = await (navigator as any).serial.requestPort(filters === undefined ? null : {filters: filters});
        } catch (e) {
            // console.log(e);
            return false;
        }
        return true;
    }

    public async openSerialPort(serialOptions?: SerialOptions): Promise<boolean> {
        if (this?.port) {
            try {
                // console.log(this.port.getInfo().usbProductId);
                // console.log(this.port.getInfo().usbVendorId);
                // console.log(this.port.getInfo().id);
                // console.log(this.port.getInfo().displayName);
                await this.port.open(serialOptions === undefined ? this.serialOptions : serialOptions);
                this.access = true;
                this.readable = this.port.readable;
                this.writable = this.port.writable;
                this.reader = this.readable.getReader();
                this.recreateStreams();
                this.syncReadData();
                this.writer = this.writable.getWriter();
            } catch (e) {
                console.log(e);
                return false;
            }
        } else {
            console.log('Web serial doesn\'t seem to be enabled in your browser. Try enabling it by visiting:')
            console.log('chrome://flags/#enable-experimental-web-platform-features');
            console.log('opera://flags/#enable-experimental-web-platform-features');
            console.log('edge://flags/#enable-experimental-web-platform-features');
            return false;
        }
        return true;
    }

    public async write(data: Uint8Array | string): Promise<void> {
        let dataArrayBuffer: Uint8Array;
        if (typeof data === 'string') {
            dataArrayBuffer = this.encoder.encode(data);
        } else {
            dataArrayBuffer = data;
        }
        if (this?.writer) {
            await this.writer.write(dataArrayBuffer);
        }
        return;
    }

    async read(channel: string): Promise<Uint8Array | null> {
        if (this.iostreams.reader[channel]) {
            try {
                const readerData = await this.iostreams.reader[channel].read();
                return readerData.value;
            } catch (err) {
                const errorMessage = `error reading data: ${err}`;
                console.log(errorMessage);
                return null;
            }
        } else {
            return null
        }
    }

    getReadStream(channel: string): ReadableStreamDefaultReader {
        return this.iostreams.reader[channel];
    }

    async closeIoStream() {
        if (this?.iostreams) {
            for (let i in this.iostreams.reader) {
                this.iostreams.reader[i].cancel();
                this.iostreams.reader[i].releaseLock();
                this.iostreams.streams[i].cancel();
            }
        }
    }

    async closeReadableStream() {
        await this.reader?.cancel();
        await this.reader?.releaseLock();
        await this.readable?.cancel();
        return;
    }

    async disconnect(): Promise<boolean> {
        if (this?.readable && this?.writable) {
            this.access = false;
            try {
                await this.closeIoStream();
                await this.closeReadableStream();

                this.writer?.close();
                if (this?.port) {
                    await this.port.readable.cancel();
                    await this.port.close();
                    this.reader = undefined;
                    this.writer = undefined;
                    this.readable = undefined;
                    this.writable = undefined;
                }
            } catch (e) {
                console.log(e);
            }
        }
        return true;
    }

    getStatus(): boolean {
        if (this?.port) {
            return !!this.port?.readable;
        } else {
            return false;
        }
    }
}

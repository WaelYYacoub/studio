export const buildQrPayload = (passId: string, plateAlpha: string, plateNum: string, expiresAt: Date) => {
    return {
        v: 1,
        pid: passId,
        pa: plateAlpha,
        pn: plateNum,
        exp: Math.floor(expiresAt.getTime() / 1000)
    };
};

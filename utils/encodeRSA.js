import { JSEncrypt } from 'jsencrypt';

export default function encodeRSA(data) {
    const rsa = new JSEncrypt();
    const rsaPublicKey = window.localStorage.getItem('rsaPublicKey');
    rsa.setPublicKey(rsaPublicKey);
    if (rsaPublicKey) {
        const value = rsa.encrypt(data);
        return value;
    }
    return data;
}

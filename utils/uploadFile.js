import * as qiniu from 'qiniu-js';
import fetch from './fetch';

/**
 * 上传文件到服务器 支持七牛、DFS
 * @param {string} blob 文件blob数据
 * @param {string} qiniuKey 七牛文件key
 * @param {string} fileName 文件名
 * @param {Function} qiniuNextEventCallback 七牛上传进度回调
 */
export default function uploadFile(blob, qiniuKey, fileName, qiniuNextEventCallback) {
    return new Promise(async (resolve, reject) => {
        const [getTokenErr, tokenRes] = await fetch('uploadToken');
        console.log('1111',getTokenErr)
        if (getTokenErr) {
            return reject(getTokenErr);
        }
        console.log('2222',tokenRes.useUploadFile)
        if (tokenRes.useUploadFile === true) {
            console.log(1111111111)
            const [uploadErr, result] = await fetch('uploadFile', {
                file: blob,
                fileName,
            });
            if (uploadErr) {
                return reject(uploadErr);
            }
            resolve(result.url);
            // if (qiniuNextEventCallback) {
            //     qiniuNextEventCallback({info : {total: { percent : '100%' }}});
            // }
        } else {
            const result = qiniu.upload(blob, qiniuKey, tokenRes.token, { useCdnDomain: true }, {});
            result.subscribe({
                next: (info) => {
                    if (qiniuNextEventCallback) {
                        qiniuNextEventCallback(info);
                    }
                },
                error: (qiniuErr) => {
                    reject(qiniuErr);
                },
                complete: async (info) => {
                    const imageUrl = `${tokenRes.urlPrefix + info.key}`;
                    resolve(imageUrl);
                },
            });
        }
    });
}

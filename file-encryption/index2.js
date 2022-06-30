const encryptBox = document.querySelector('.download-enc');
const decryptBox = document.querySelector('.download-dec');
const encryptLink = document.querySelector('.encrypt');
const decryptLink = document.querySelector('.decrypt');
var reader = new FileReader();
let fileHandle;

async function encrypt() {
    encryptBox.style.display = 'none';
    [fileHandle] = await window.showOpenFilePicker();
    let file = await fileHandle.getFile();
    reader.onload = e => {
        var encrypted = CryptoJS.AES.encrypt(e.target.result, "thawthuhan");
        encryptLink.setAttribute('href', 'data:application/octet-stream,' + encrypted);
        encryptLink.setAttribute('download', fileHandle.name + '.thaw');
        encryptBox.style.display = 'inline-block';
    }
    reader.readAsDataURL(file);
}

async function decrypt() {
    const options = {
        types: [
            {
                description: "encryption file",
                accept: {
                    "file/plain": [".thaw"],
                },
            },
        ],
    };
    [fileHandle] = await window.showOpenFilePicker(options);
    let file = await fileHandle.getFile();
    reader.onload = e => {
        var decrypted = CryptoJS.AES.decrypt(e.target.result, "thawthuhan")
            .toString(CryptoJS.enc.Latin1);

        if (!/^data:/.test(decrypted)) {
            alert("Invalid pass phrase or file! Please try again.");
            return false;
        }

        decryptLink.setAttribute('href', decrypted);
        decryptLink.setAttribute('download', fileHandle.name.replace('.thaw', ''));
        decryptBox.style.display = 'inline-block';
    }
    reader.readAsText(file);
}
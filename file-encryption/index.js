const encryptInput = document.querySelector('#encryptFile');
const decryptInput = document.querySelector('#decryptFile');
const encPasswordInput = document.querySelector('#enc-password');
const decPasswordInput = document.querySelector('#dec-password');
const encDownLoadLink = document.querySelector('#enc-download');
const decDownLoadLink = document.querySelector('#dec-download');

let file;
var reader = new FileReader();

encryptInput.addEventListener('change', e => {
    let fileList = e.target.files;
    if (fileList.length !== 0) {
        file = fileList[0];
    }

    if (file.size > 15000000) {
        alert("Invalid file! only max 15MB allowed...");
        e.target.value = '';
        return;
    }
    file = fileList[0];
})

decryptInput.addEventListener('change', e => {
    let fileList = e.target.files;
    if (fileList.length !== 0) {
        file = fileList[0];
    }
    if (!file.name.includes('.enc-thaw')) {
        alert("Invalid file! Please choose encrypted file...");
        e.target.value = '';
        return;
    }
})

async function encrypt() {
    reader.onload = e => {
        let data = e.target.result;
        if (encPasswordInput.value.length == 0) {
            alert('Enter Encrypt Password');
            return;
        }
        var encrypted = CryptoJS.AES.encrypt(data, encPasswordInput.value);
        encDownLoadLink.setAttribute('href', 'data:application/octet-stream,' + encrypted);
        encDownLoadLink.setAttribute('download', file.name + ".enc-thaw");
        encDownLoadLink.classList.remove('d-none');
        encPasswordInput.value = '';
        encryptInput.value = '';
    }
    reader.readAsDataURL(file);
}

function decrypt() {
    reader.onload = e => {
        let data = e.target.result;
        if (decPasswordInput.value.length == 0) {
            alert('Enter Encrypt Password');
            return;
        }

        var decrypted = CryptoJS.AES.decrypt(data, decPasswordInput.value).toString(CryptoJS.enc.Latin1);
        if (!/^data:/.test(decrypted)) {
            alert("Invalid passphrase or file! Please try again.");
            return false;
        }

        decDownLoadLink.setAttribute('href', decrypted);
        decDownLoadLink.setAttribute('download', file.name.replace(".enc-thaw", ''));
        decDownLoadLink.classList.remove('d-none');
        decPasswordInput.value = '';
        decryptInput.value = '';
    }
    reader.readAsText(file);
}
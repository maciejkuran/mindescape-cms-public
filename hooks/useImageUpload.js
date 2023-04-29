import { useState } from 'react';

const useImageUpload = () => {
  const [imgUrl, setImgUrl] = useState(null);
  const [imgUploadError, setImgUploadError] = useState(null);

  const errorAccept = () => {
    setImgUploadError(null);
  };

  const getImageFile = (e, imageType) => {
    setImgUploadError(null);

    const reader = new FileReader();

    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);

      reader.addEventListener('load', async () => {
        const imageName = e.target.files[0].name;
        const base64str = reader.result.split(',')[1];

        try {
          const res = await fetch('/api/image', {
            method: 'POST',
            body: JSON.stringify({
              image: base64str,
              imageType: imageType,
              imageSize: e.target.files[0].size / 1024,
              imageName: imageName,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message);
          }

          const data = await res.json();
          setImgUrl(data.location);
        } catch (error) {
          e.target.value = ''; //clearing input just to make sure another failed input will be rejected and err msg displayed
          setImgUploadError(error.message);
        }
      });
    }
  };

  return { getImageFile, imgUrl, imgUploadError, errorAccept };
};

export default useImageUpload;

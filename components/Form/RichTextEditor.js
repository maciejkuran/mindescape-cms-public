import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { Editor } from '@tinymce/tinymce-react';

const RichTextEditor = forwardRef((props, ref) => {
  const editorRef = useRef(null);

  const articleDataToEdit = props.articleDataToEdit && props.articleDataToEdit;

  //I wanna get editor content when the form is submitted (avoid having controlled component that sets state on every keystroke - due potential performance issues. That's why I pass to the parent component method that will retreive the editor content when the form is submitted)
  const getRichTextContent = () => {
    if (editorRef.current) {
      const content = editorRef.current.getContent();
      return content;
    }
  };

  useImperativeHandle(ref, () => {
    return {
      getRichTextContent,
    };
  });

  return (
    <>
      <Editor
        ref={editorRef}
        id="rich-editor"
        apiKey={process.env.NEXT_PUBLIC_TINY_APIKEY}
        onInit={(evt, editor) => (editorRef.current = editor)}
        initialValue={
          articleDataToEdit && articleDataToEdit.body
            ? articleDataToEdit.body
            : '<p>Let your creative and imaginative mind run freely</p>'
        }
        init={{
          height: 500,
          menubar: true,
          images_upload_url: '/api/image',
          images_upload_handler: async (blobInfo, progress) => {
            return new Promise((resolve, reject) => {
              const image = blobInfo.blob();
              const reader = new FileReader();

              if (image) {
                reader.readAsDataURL(image);

                reader.addEventListener('load', async () => {
                  const base64str = reader.result.split(',')[1]; //removing first part which includes img type... etc (firebase specific problem)

                  const res = await fetch('/api/image', {
                    method: 'POST',
                    body: JSON.stringify({
                      image: base64str,
                      imageType: 'image',
                      imageSize: image.size / 1024,
                      imageName: image.name,
                    }),
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  });

                  const data = await res.json();

                  if (!res.ok) {
                    reject(data.message);
                  }

                  resolve(data.location);
                });
              }
            });
          },
          plugins: [
            'advlist',
            'autolink',
            'lists',
            'link',
            'image',
            'charmap',
            'preview',
            'anchor',
            'searchreplace',
            'visualblocks',
            'code',
            'fullscreen',
            'insertdatetime',
            'media',
            'table',
            'code',
            'help',
            'wordcount',
          ],
          toolbar:
            'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        }}
      />
    </>
  );
});

RichTextEditor.displayName = 'Rich Text Editor'; //FIX at Vercel deploy: Error: Component definition is missing display name  react/display-name

export default RichTextEditor;

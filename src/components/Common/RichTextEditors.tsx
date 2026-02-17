'use client';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

export default function RichTextEditor({ description, setDescription }: any) {
  return (
    <div> {/* container height fixed */}
      <CKEditor
        editor={ClassicEditor as any}
        data={description || ""}
        onReady={editor => { 
          // Force editor editable area to take full container height
          //editor.ui.view.editable.element.style.height = '200px';
        }}
        onChange={(event: any, editor: any) => {
          const data = editor.getData();
          setDescription(data);
        }}
      />
    </div>
  );
}

// DevToolKit File Upload - Shared upload utility
// Usage: setupFileUpload('textareaId', '.json,.txt', optionalCallback)
(function() {
  var MAX_SIZE = 10 * 1024 * 1024; // 10MB

  function getI18n(key) {
    if (window.I18N_ALL && window.I18N_GET) {
      var lang = localStorage.getItem('devtoolkit-lang') || 'en';
      var dict = window.I18N_GET('_home', lang);
      if (dict[key]) return dict[key];
    }
    var fallbacks = { upload: 'Upload File', drop_file: 'or drag & drop file here', file_too_large: 'File too large (max 10MB)' };
    return fallbacks[key] || key;
  }

  window.setupFileUpload = function(textareaId, accept, onLoaded) {
    var textarea = document.getElementById(textareaId);
    if (!textarea) return;

    // Create upload area container
    var uploadArea = document.createElement('div');
    uploadArea.className = 'upload-area';

    // Create hidden file input
    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = accept || '';
    fileInput.style.display = 'none';

    // Create upload button
    var uploadBtn = document.createElement('button');
    uploadBtn.className = 'btn btn-upload';
    uploadBtn.innerHTML = '<span class="upload-icon">📁</span> ' + getI18n('upload');
    uploadBtn.setAttribute('data-i18n-text', 'upload');

    // Create drag hint
    var dropHint = document.createElement('span');
    dropHint.className = 'upload-hint';
    dropHint.textContent = getI18n('drop_file');
    dropHint.setAttribute('data-i18n-text', 'drop_file');

    uploadArea.appendChild(uploadBtn);
    uploadArea.appendChild(dropHint);
    uploadArea.appendChild(fileInput);

    // Insert after textarea
    textarea.parentNode.insertBefore(uploadArea, textarea.nextSibling);

    // Click handler
    uploadBtn.addEventListener('click', function(e) {
      e.preventDefault();
      fileInput.click();
    });

    // File selected handler
    fileInput.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        readFile(this.files[0]);
      }
      // Reset so same file can be re-selected
      this.value = '';
    });

    // Read file content
    function readFile(file) {
      if (file.size > MAX_SIZE) {
        alert(getI18n('file_too_large'));
        return;
      }
      var reader = new FileReader();
      reader.onload = function(e) {
        textarea.value = e.target.result;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
        if (typeof onLoaded === 'function') {
          onLoaded(e.target.result);
        }
      };
      reader.readAsText(file);
    }

    // Drag & drop support on textarea
    textarea.addEventListener('dragover', function(e) {
      e.preventDefault();
      e.stopPropagation();
      textarea.classList.add('drag-over');
    });

    textarea.addEventListener('dragleave', function(e) {
      e.preventDefault();
      e.stopPropagation();
      textarea.classList.remove('drag-over');
    });

    textarea.addEventListener('drop', function(e) {
      e.preventDefault();
      e.stopPropagation();
      textarea.classList.remove('drag-over');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        readFile(e.dataTransfer.files[0]);
      }
    });

    // Drag & drop on the upload area itself
    uploadArea.addEventListener('dragover', function(e) {
      e.preventDefault();
      e.stopPropagation();
      uploadArea.classList.add('upload-drag-over');
    });

    uploadArea.addEventListener('dragleave', function(e) {
      e.preventDefault();
      e.stopPropagation();
      uploadArea.classList.remove('upload-drag-over');
    });

    uploadArea.addEventListener('drop', function(e) {
      e.preventDefault();
      e.stopPropagation();
      uploadArea.classList.remove('upload-drag-over');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        readFile(e.dataTransfer.files[0]);
      }
    });
  };
})();

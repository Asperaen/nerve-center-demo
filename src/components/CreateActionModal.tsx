import { useState, useRef, useEffect, useCallback } from 'react';
import { XMarkIcon, PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { Action, ActionPriority, ActionAttachment } from '../types';
import { useActions } from '../contexts/ActionsContext';

interface CreateActionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockOwners = [
  'Tony Bonaderon - CEO',
  'Douglass Chen - CTO',
  'Ivon Chiou - CTO',
  'Jack Wang - CFO',
];

export default function CreateActionModal({
  isOpen,
  onClose,
}: CreateActionModalProps) {
  const { addAction } = useActions();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [owner, setOwner] = useState('');
  const [priority, setPriority] = useState<ActionPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [attachments, setAttachments] = useState<ActionAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  // 处理图片文件（粘贴或上传）
  const handleImageFile = useCallback(async (file: File): Promise<void> => {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }

    // 验证文件大小（例如：最大 5MB）
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('图片大小不能超过 5MB');
      return;
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const newAttachment: ActionAttachment = {
          id: `attachment-${Date.now()}-${Math.random()}`,
          name: file.name || `screenshot-${Date.now()}.png`,
          url: result, // base64 数据 URL
          type: 'image',
          uploadedAt: new Date(),
        };
        setAttachments((prev) => [...prev, newAttachment]);
        resolve();
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  // 处理粘贴事件
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            await handleImageFile(file);
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [isOpen, handleImageFile]);

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        handleImageFile(file);
      });
    }
    // 重置 input，允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 删除附件
  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  // 处理拖拽
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files) {
      Array.from(files).forEach((file) => {
        handleImageFile(file);
      });
    }
  };

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!title.trim() || !description.trim() || !owner || !dueDate) {
      return;
    }

    const newAction: Action = {
      id: `action-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      owner,
      status: 'todo',
      priority,
      dueDate: new Date(dueDate),
      createdDate: new Date(),
      comments: [],
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    addAction(newAction);

    // Reset form
    setTitle('');
    setDescription('');
    setOwner('');
    setPriority('medium');
    setDueDate('');
    setAttachments([]);

    onClose();
  };

  const handleClose = () => {
    // Reset form on close
    setTitle('');
    setDescription('');
    setOwner('');
    setPriority('medium');
    setDueDate('');
    setAttachments([]);
    onClose();
  };

  const isFormValid = title.trim() && description.trim() && owner && dueDate;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div
        className='fixed inset-0 bg-black bg-opacity-50 transition-opacity'
        onClick={handleClose}></div>

      <div className='flex items-center justify-center min-h-screen p-4'>
        <div
          className='relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto'
          onClick={(e) => e.stopPropagation()}>
          <div className='flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10'>
            <div>
              <h3 className='text-xl font-semibold text-gray-900'>
                Create New Action
              </h3>
              <p className='mt-1 text-sm text-gray-500'>
                Add a new action to the Action Tracker
              </p>
            </div>
            <button
              onClick={handleClose}
              className='p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors'>
              <XMarkIcon className='w-6 h-6' />
            </button>
          </div>

          <div className='p-6 space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Title *
              </label>
              <input
                type='text'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='Enter action title...'
                className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Description *
              </label>
              <textarea
                ref={descriptionRef}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='Describe the action... (支持粘贴截图: Ctrl+V / Cmd+V)'
                className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 resize-none'
                rows={4}
                required
              />
            </div>

            {/* 截图/附件上传区域 */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Attachments (Screenshots)
              </label>
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className='border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary-400 transition-colors'>
                <div className='text-center'>
                  <PhotoIcon className='w-12 h-12 text-gray-400 mx-auto mb-2' />
                  <p className='text-sm text-gray-600 mb-2'>
                    拖拽图片到此处，或点击选择文件
                  </p>
                  <p className='text-xs text-gray-500 mb-3'>
                    支持粘贴截图 (Ctrl+V / Cmd+V)
                  </p>
                  <button
                    type='button'
                    onClick={() => fileInputRef.current?.click()}
                    className='px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors'>
                    选择图片
                  </button>
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/*'
                    multiple
                    onChange={handleFileSelect}
                    className='hidden'
                  />
                </div>
              </div>

              {/* 附件预览 */}
              {attachments.length > 0 && (
                <div className='mt-4 grid grid-cols-2 gap-4'>
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className='relative group border border-gray-200 rounded-lg overflow-hidden'>
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className='w-full h-32 object-cover'
                      />
                      <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center'>
                        <button
                          type='button'
                          onClick={() => handleRemoveAttachment(attachment.id)}
                          className='opacity-0 group-hover:opacity-100 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all'>
                          <TrashIcon className='w-5 h-5' />
                        </button>
                      </div>
                      <div className='absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-2 truncate'>
                        {attachment.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Owner *
                </label>
                <select
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500'
                  required>
                  <option value=''>Select owner...</option>
                  {mockOwners.map((ownerOption) => (
                    <option
                      key={ownerOption}
                      value={ownerOption}>
                      {ownerOption}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Priority *
                </label>
                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as ActionPriority)
                  }
                  className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500'
                  required>
                  <option value='high'>High</option>
                  <option value='medium'>Medium</option>
                  <option value='low'>Low</option>
                </select>
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Due Date *
              </label>
              <input
                type='date'
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500'
                required
              />
            </div>
          </div>

          <div className='flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0'>
            <button
              onClick={handleClose}
              className='px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'>
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isFormValid}
              className='px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'>
              Create Action
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

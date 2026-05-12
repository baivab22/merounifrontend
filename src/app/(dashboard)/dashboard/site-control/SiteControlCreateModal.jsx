'use client'
import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/ui/shadcn/dialog'
import { useForm, Controller } from 'react-hook-form'
import { Button } from '@/ui/shadcn/button'
import { Label } from '@/ui/shadcn/label'
import { Input } from '@/ui/shadcn/input'
import { Select } from '@/ui/shadcn/select'
import { updateSiteConfig } from '../../../actions/siteConfigActions'
import { useToast } from '@/hooks/use-toast'
import { CONFIG_TYPES } from './siteControlConstants'
import TipTapEditor from '@/ui/shadcn/tiptap-editor'
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import SearchSelectCreate from '@/ui/shadcn/search-select-create'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const FAQSortableItem = ({
  faq,
  index,
  onRemove,
  onUpdate,
  isExpanded,
  onToggle
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: faq.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className='bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm'
    >
      <div className='flex items-center gap-3 p-3 bg-slate-50 border-b border-slate-100'>
        <div
          {...attributes}
          {...listeners}
          className='cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 p-1'
        >
          <GripVertical size={18} />
        </div>
        <div
          className='flex-1 cursor-pointer flex items-center justify-between'
          onClick={onToggle}
        >
          <span className='text-sm font-semibold text-slate-700 truncate max-w-[400px]'>
            {faq.question || `Question ${index + 1}`}
          </span>
          <div className='flex items-center gap-2'>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
        <button
          type='button'
          onClick={onRemove}
          className='text-slate-400 hover:text-red-500 transition-colors p-1'
        >
          <Trash2 size={16} />
        </button>
      </div>

      {isExpanded && (
        <div className='p-4 space-y-4 animate-in slide-in-from-top-2 duration-200'>
          <div className='space-y-1'>
            <Label className='text-xs'>Question</Label>
            <Input
              value={faq.question}
              onChange={(e) => onUpdate('question', e.target.value)}
              placeholder='Enter question...'
              className='bg-white'
            />
          </div>
          <div className='space-y-1'>
            <Label className='text-xs'>Answer</Label>
            <TipTapEditor
              value={faq.answer}
              onChange={(val) => onUpdate('answer', val)}
              placeholder='Enter answer...'
              height='200px'
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function SiteControlCreateModal({ isOpen, onClose, onSuccess }) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [expandedItems, setExpandedItems] = useState({})

  const sensors = useSensors(useSensor(PointerSensor))

  const {
    control,
    handleSubmit,
    reset,
    watch,
    register,
    setValue,
    formState: { errors }
  } = useForm({
    shouldUnregister: true,
    defaultValues: {
      type: '',
      value: ''
    }
  })

  const selectedType = watch('type')

  const onSearchTypes = async (query) => {
    if (!query) return CONFIG_TYPES
    const lower = query.toLowerCase()
    return CONFIG_TYPES.filter(
      (t) =>
        t.label.toLowerCase().includes(lower) ||
        t.section.toLowerCase().includes(lower)
    )
  }

  // Handle initial value based on type
  useEffect(() => {
    if (selectedType) {
      const typeConfig = getSelectedTypeConfig(selectedType)
      if (typeConfig?.inputType === 'faq') {
        const currentValue = watch('value')
        if (!Array.isArray(currentValue)) {
          setValue('value', [
            { id: `faq-${Date.now()}`, question: '', answer: '' }
          ])
        }
      } else {
        const currentValue = watch('value')
        if (Array.isArray(currentValue)) {
          setValue('value', '')
        }
      }
    }
  }, [selectedType, setValue])

  const getSelectedTypeConfig = (typeValue) => {
    return CONFIG_TYPES.find((ct) => ct.value === typeValue)
  }

  const selectedTypeConfig = getSelectedTypeConfig(selectedType)

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      let finalValue = data.value
      if (selectedTypeConfig?.inputType === 'faq') {
        // Remove temp IDs before saving
        const cleanedFaqs = data.value.map(({ id, ...rest }) => rest)
        finalValue = JSON.stringify(cleanedFaqs)
      }
      await updateSiteConfig({ type: data.type, value: finalValue })
      const label =
        CONFIG_TYPES.find((ct) => ct.value === data.type)?.label || data.type
      toast({
        title: 'Success',
        description: `Configuration for "${label}" created successfully`
      })
      onSuccess && onSuccess()
      handleClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create configuration',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} className='max-w-4xl'>
      <DialogContent className='max-w-4xl max-h-[90vh] flex flex-col p-0'>
        <DialogHeader className='px-6 py-4 border-b'>
          <DialogTitle className='text-lg font-semibold text-gray-900'>
            Add New Configuration
          </DialogTitle>
          <DialogClose onClick={handleClose} />
        </DialogHeader>

        <div className='flex-1 overflow-y-auto p-6'>
          <form
            id='site-control-create-form'
            onSubmit={handleSubmit(onSubmit)}
            className='space-y-8'
          >
            <section className='space-y-4'>
              <h3 className='text-base font-semibold text-slate-800 border-b pb-2'>
                Configuration Details
              </h3>

              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label required>Configuration Type</Label>
                  <Controller
                    name='type'
                    control={control}
                    rules={{ required: 'Configuration type is required' }}
                    render={({ field }) => (
                      <SearchSelectCreate
                        onSearch={onSearchTypes}
                        onSelect={(item) => field.onChange(item.value)}
                        onRemove={() => field.onChange('')}
                        selectedItems={CONFIG_TYPES.find(
                          (t) => t.value === field.value
                        )}
                        placeholder='Search configuration type...'
                        displayKey='label'
                        valueKey='value'
                        isMulti={false}
                        allowCreate={false}
                      />
                    )}
                  />
                  {errors.type && (
                    <span className='text-xs text-red-500'>
                      {errors.type.message}
                    </span>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label required>Value</Label>
                  {selectedTypeConfig?.inputType === 'richtext' ? (
                    <Controller
                      name='value'
                      control={control}
                      rules={{ required: 'Value is required' }}
                      render={({ field }) => (
                        <div className='mt-1'>
                          <TipTapEditor
                            value={field.value}
                            onChange={(data) => field.onChange(data)}
                            placeholder={`Enter ${selectedTypeConfig.label.toLowerCase()}...`}
                            height='300px'
                          />
                        </div>
                      )}
                    />
                  ) : selectedTypeConfig?.inputType === 'faq' ? (
                    <div className='space-y-4'>
                      <Controller
                        name='value'
                        control={control}
                        render={({ field }) => {
                          const faqs = Array.isArray(field.value)
                            ? field.value
                            : []

                          const addFaq = () => {
                            const newFaq = {
                              id: `faq-${Date.now()}`,
                              question: '',
                              answer: ''
                            }
                            field.onChange([...faqs, newFaq])
                            setExpandedItems((prev) => ({
                              ...prev,
                              [newFaq.id]: true
                            }))
                          }

                          const removeFaq = (index) => {
                            const updated = faqs.filter((_, i) => i !== index)
                            field.onChange(
                              updated.length > 0
                                ? updated
                                : [
                                    {
                                      id: `faq-${Date.now()}`,
                                      question: '',
                                      answer: ''
                                    }
                                  ]
                            )
                          }

                          const updateFaq = (index, key, val) => {
                            const updated = faqs.map((faq, i) =>
                              i === index ? { ...faq, [key]: val } : faq
                            )
                            field.onChange(updated)
                          }

                          const handleDragEnd = (event) => {
                            const { active, over } = event
                            if (over && active.id !== over.id) {
                              const oldIndex = faqs.findIndex(
                                (f) => f.id === active.id
                              )
                              const newIndex = faqs.findIndex(
                                (f) => f.id === over.id
                              )
                              field.onChange(
                                arrayMove(faqs, oldIndex, newIndex)
                              )
                            }
                          }

                          const toggleExpand = (id) => {
                            setExpandedItems((prev) => ({
                              ...prev,
                              [id]: !prev[id]
                            }))
                          }

                          return (
                            <div className='space-y-4'>
                              <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                              >
                                <SortableContext
                                  items={faqs.map((f) => f.id)}
                                  strategy={verticalListSortingStrategy}
                                >
                                  <div className='space-y-3'>
                                    {faqs.map((faq, index) => (
                                      <FAQSortableItem
                                        key={faq.id}
                                        faq={faq}
                                        index={index}
                                        isExpanded={!!expandedItems[faq.id]}
                                        onToggle={() => toggleExpand(faq.id)}
                                        onRemove={() => removeFaq(index)}
                                        onUpdate={(key, val) =>
                                          updateFaq(index, key, val)
                                        }
                                      />
                                    ))}
                                  </div>
                                </SortableContext>
                              </DndContext>
                              <Button
                                type='button'
                                variant='outline'
                                onClick={addFaq}
                                className='w-full border-dashed border-2 hover:border-[#387cae] hover:text-[#387cae] flex items-center justify-center gap-2'
                              >
                                <Plus size={16} />
                                Add FAQ Item
                              </Button>
                            </div>
                          )
                        }}
                      />
                    </div>
                  ) : (
                    <Input
                      type={selectedTypeConfig?.inputType || 'text'}
                      placeholder={
                        selectedTypeConfig
                          ? `Enter ${selectedTypeConfig.label.toLowerCase()}...`
                          : 'Enter value...'
                      }
                      {...register('value', { required: 'Value is required' })}
                    />
                  )}
                  {errors.value && (
                    <span className='text-xs text-red-500'>
                      {errors.value.message}
                    </span>
                  )}
                </div>
              </div>
            </section>
          </form>
        </div>

        <div className='sticky bottom-0 bg-white border-t p-4 px-6 flex justify-end gap-3'>
          <Button type='button' variant='outline' onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type='submit'
            form='site-control-create-form'
            disabled={saving}
            className='bg-[#387cae] hover:bg-[#387cae]/90 text-white min-w-[120px]'
          >
            {saving ? 'Processing...' : 'Create Configuration'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

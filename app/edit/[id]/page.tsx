"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Trash, X, Plus, Save, ArrowLeft, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// 定义笔记类型
type Note = {
  id: string
  title: string
  content: string
  tags: string[]
  notebookId: string
  timestamp: string
  preview?: string
  lastUpdated: number
}

// 定义标签类型
type Tag = {
  id: string
  name: string
}

// 定义笔记本类型
type Notebook = {
  id: string
  name: string
}

// 生成笔记预览
const generatePreview = (content: string, length = 60): string => {
  const plainText = content.replace(/#{1,6}\s/g, "").trim()
  return plainText.length > length ? plainText.substring(0, length) + "..." : plainText
}

// 更新时间戳
const updateTimestamp = (): string => {
  return "just now"
}

// 自定义按钮组件
const CustomButton = ({
  children,
  onClick,
  variant = "default",
  className,
  ...props
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: "default" | "outline" | "ghost" | "destructive"
  className?: string
  [key: string]: any
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-full transition-colors"
  const variantStyles = {
    default: "bg-black text-white hover:bg-gray-800",
    outline: "border border-gray-300 hover:bg-gray-100",
    ghost: "hover:bg-gray-100",
    destructive: "text-red-500 hover:bg-red-50 hover:text-red-600",
  }

  return (
    <button onClick={onClick} className={cn(baseStyles, variantStyles[variant], className)} {...props}>
      {children}
    </button>
  )
}

export default function EditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const noteId = params.id

  // 笔记数据
  const [notes, setNotes] = useState<Note[]>([])
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [notebooks, setNotebooks] = useState<Notebook[]>([])

  // 编辑模式状态
  const [isEditing, setIsEditing] = useState(true)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [newTag, setNewTag] = useState("")

  // 对话框状态
  const [dialogOpen, setDialogOpen] = useState(false)

  // 自动保存计时器
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  // 从localStorage加载数据
  useEffect(() => {
    const savedNotes = localStorage.getItem("notes")
    const savedTags = localStorage.getItem("tags")
    const savedNotebooks = localStorage.getItem("notebooks")

    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes)
      setNotes(parsedNotes)

      // 查找当前笔记
      const currentNote = parsedNotes.find((note: Note) => note.id === noteId)
      if (currentNote) {
        setEditingNote({ ...currentNote })
      } else {
        // 如果找不到笔记，返回首页
        toast({
          title: "笔记不存在",
          description: "无法找到请求的笔记",
          variant: "destructive",
        })
        router.push("/")
      }
    }

    if (savedTags) {
      setAvailableTags(JSON.parse(savedTags))
    }

    if (savedNotebooks) {
      setNotebooks(JSON.parse(savedNotebooks))
    }
  }, [noteId, router])

  // 自动保存功能
  useEffect(() => {
    if (isEditing && editingNote) {
      // 清除之前的计时器
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }

      // 设置新的计时器，5秒后自动保存
      autoSaveTimerRef.current = setTimeout(() => {
        autoSave()
      }, 5000)
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [editingNote, isEditing])

  // 自动保存
  const autoSave = () => {
    if (!editingNote) return

    // 生成预览文本
    const preview = generatePreview(editingNote.content)

    // 更新时间戳和最后更新时间
    const now = Date.now()
    const updatedNote = {
      ...editingNote,
      preview,
      timestamp: updateTimestamp(),
      lastUpdated: now,
    }

    const updatedNotes = notes.map((note) => (note.id === updatedNote.id ? updatedNote : note))

    setNotes(updatedNotes)
    localStorage.setItem("notes", JSON.stringify(updatedNotes))

    setLastSaved(`自动保存于 ${new Date().toLocaleTimeString()}`)

    // 不退出编辑模式，只更新编辑中的笔记
    setEditingNote(updatedNote)
  }

  // 取消编辑
  const cancelEditing = () => {
    // 如果有未保存的更改，显示确认对话框
    if (JSON.stringify(notes.find((note) => note.id === noteId)) !== JSON.stringify(editingNote)) {
      if (window.confirm("您有未保存的更改，确定要放弃吗？")) {
        router.push("/")
      }
    } else {
      router.push("/")
    }
  }

  // 保存编辑后的笔记
  const saveNote = () => {
    if (!editingNote) return

    // 生成预览文本
    const preview = generatePreview(editingNote.content)

    // 更新时间戳和最后更新时间
    const now = Date.now()
    const updatedNote = {
      ...editingNote,
      preview,
      timestamp: updateTimestamp(),
      lastUpdated: now,
    }

    const updatedNotes = notes.map((note) => (note.id === updatedNote.id ? updatedNote : note))

    setNotes(updatedNotes)
    localStorage.setItem("notes", JSON.stringify(updatedNotes))

    // 更新标签系统 - 移除未使用的标签
    updateTagSystem()

    // 显示成功提示
    toast({
      title: "笔记已保存",
      description: "您的更改已成功保存。",
      duration: 3000,
    })

    // 返回首页
    router.push("/")
  }

  // 更新标签系统 - 检查并移除未使用的标签
  const updateTagSystem = () => {
    if (!editingNote) return

    // 获取所有笔记中使用的标签
    const usedTags = new Set<string>()

    // 添加当前编辑笔记的标签
    editingNote.tags.forEach((tag) => usedTags.add(tag))

    // 添加其他笔记的标签
    notes.forEach((note) => {
      if (note.id !== editingNote.id) {
        note.tags.forEach((tag) => usedTags.add(tag))
      }
    })

    // 过滤掉未使用的标签
    const updatedTags = availableTags.filter((tag) => usedTags.has(tag.name))

    setAvailableTags(updatedTags)
    localStorage.setItem("tags", JSON.stringify(updatedTags))
  }

  // 更新编辑中的笔记标题
  const updateNoteTitle = (title: string) => {
    if (!editingNote) return
    setEditingNote({ ...editingNote, title })
  }

  // 更新编辑中的笔记内容
  const updateNoteContent = (content: string) => {
    if (!editingNote) return
    setEditingNote({ ...editingNote, content })
  }

  // 更新编辑中的笔记所属笔记本
  const updateNoteNotebook = (notebookId: string) => {
    if (!editingNote) return
    setEditingNote({ ...editingNote, notebookId })
  }

  // 添加标签到编辑中的笔记
  const addTagToNote = (tag: string) => {
    if (!editingNote) return
    if (editingNote.tags.includes(tag)) return

    setEditingNote({
      ...editingNote,
      tags: [...editingNote.tags, tag],
    })
  }

  // 从编辑中的笔记移除标签
  const removeTagFromNote = (tag: string) => {
    if (!editingNote) return

    setEditingNote({
      ...editingNote,
      tags: editingNote.tags.filter((t) => t !== tag),
    })
  }

  // 添加新标签
  const addNewTag = () => {
    if (!newTag.trim() || availableTags.some((tag) => tag.name === newTag)) {
      setNewTag("")
      return
    }

    const newTagObj = {
      id: `tag-${Date.now()}`,
      name: newTag,
    }

    const updatedTags = [...availableTags, newTagObj]
    setAvailableTags(updatedTags)
    localStorage.setItem("tags", JSON.stringify(updatedTags))

    if (editingNote) {
      addTagToNote(newTag)
    }

    setNewTag("")
  }

  // 删除笔记
  const deleteNote = () => {
    setDialogOpen(true)
  }

  // 确认删除笔记
  const confirmDeleteNote = () => {
    const updatedNotes = notes.filter((note) => note.id !== noteId)
    setNotes(updatedNotes)
    localStorage.setItem("notes", JSON.stringify(updatedNotes))

    setDialogOpen(false)

    // 更新标签系统
    const deletedNote = notes.find((note) => note.id === noteId)
    if (deletedNote) {
      const remainingNotes = notes.filter((note) => note.id !== noteId)
      updateTagsAfterNoteDeletion(deletedNote, remainingNotes)
    }

    // 显示成功提示
    toast({
      title: "笔记已删除",
      description: "笔记已成功删除。",
      duration: 3000,
    })

    // 返回首页
    router.push("/")
  }

  // 在删除笔记后更新标签
  const updateTagsAfterNoteDeletion = (deletedNote: Note, remainingNotes: Note[]) => {
    // 获取所有剩余笔记中使用的标签
    const usedTags = new Set<string>()

    remainingNotes.forEach((note) => {
      note.tags.forEach((tag) => usedTags.add(tag))
    })

    // 过滤掉未使用的标签
    const updatedTags = availableTags.filter((tag) => usedTags.has(tag.name))
    setAvailableTags(updatedTags)
    localStorage.setItem("tags", JSON.stringify(updatedTags))
  }

  if (!editingNote) {
    return <div className="flex items-center justify-center h-screen">加载中...</div>
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex items-center p-4 border-b">
        <CustomButton variant="ghost" onClick={cancelEditing} className="mr-2 p-2">
          <ArrowLeft className="h-5 w-5" />
        </CustomButton>

        <div className="flex space-x-2">
          <CustomButton variant="outline" className="flex items-center space-x-1 px-3 py-1.5 text-sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 4V20M4 12H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>AI 生成</span>
          </CustomButton>
          <CustomButton variant="outline" className="flex items-center space-x-1 px-3 py-1.5 text-sm">
            <Clock className="w-4 h-4" />
            <span>记忆</span>
          </CustomButton>
        </div>

        <div className="ml-4 font-medium">
          <input
            type="text"
            value={editingNote.title}
            onChange={(e) => updateNoteTitle(e.target.value)}
            className="border rounded-full px-3 py-1 text-sm w-40 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {lastSaved && <span className="text-xs text-gray-500">{lastSaved}</span>}
          <div className="flex space-x-2">
            <CustomButton variant="outline" onClick={cancelEditing} className="px-3 py-1.5 text-sm">
              <X className="w-4 h-4 mr-1" />
              <span>取消</span>
            </CustomButton>
            <CustomButton onClick={saveNote} className="px-3 py-1.5 text-sm">
              <Save className="w-4 h-4 mr-1" />
              <span>保存</span>
            </CustomButton>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {/* 笔记本选择 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-700">笔记本</label>
          <select
            value={editingNote.notebookId}
            onChange={(e) => updateNoteNotebook(e.target.value)}
            className="w-full rounded-full border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
          >
            {notebooks.map((notebook) => (
              <option key={notebook.id} value={notebook.id}>
                {notebook.name}
              </option>
            ))}
          </select>
        </div>

        {/* 标签区域 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {editingNote.tags.map((tag, index) => (
            <div key={index} className="flex items-center px-3 py-1 rounded-full bg-gray-100">
              <span>{tag}</span>
              <button onClick={() => removeTagFromNote(tag)} className="ml-1 text-gray-500 hover:text-gray-700">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <div className="flex items-center">
            <select
              className="border rounded-full px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  addTagToNote(e.target.value)
                  e.target.value = ""
                }
              }}
            >
              <option value="">添加标签...</option>
              {availableTags
                .filter((tag) => !editingNote.tags.includes(tag.name))
                .map((tag) => (
                  <option key={tag.id} value={tag.name}>
                    {tag.name}
                  </option>
                ))}
            </select>
            <div className="flex ml-2">
              <input
                type="text"
                placeholder="新标签"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="w-24 text-sm rounded-l-full border border-r-0 px-3 py-1 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addNewTag()
                  }
                }}
              />
              <button
                onClick={addNewTag}
                className="rounded-r-full border border-l-0 px-2 py-1 bg-gray-100 hover:bg-gray-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 笔记内容 */}
        <textarea
          value={editingNote.content}
          onChange={(e) => updateNoteContent(e.target.value)}
          className="w-full h-[calc(100%-120px)] border rounded-2xl p-4 font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
          placeholder="在此输入笔记内容..."
        />
      </div>

      <div className="p-4 border-t">
        <CustomButton variant="destructive" onClick={deleteNote} className="px-3 py-1.5 text-sm">
          <Trash className="h-4 w-4 mr-2" />
          <span>删除</span>
        </CustomButton>
      </div>

      {/* 删除确认对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>删除笔记</DialogTitle>
            <DialogDescription>您确定要删除这个笔记吗？此操作无法撤销。</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <CustomButton variant="outline" onClick={() => setDialogOpen(false)} className="px-3 py-1.5 text-sm">
              取消
            </CustomButton>
            <CustomButton variant="destructive" onClick={confirmDeleteNote} className="px-3 py-1.5 text-sm">
              删除
            </CustomButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 提示消息 */}
      <Toaster />
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PlusCircle, ChevronDown, ChevronRight, File, Hash, Search, Folder, FolderPlus, X, Edit } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import Chatbot from "../components/Chatbot"

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

// 格式化日期
const formatDate = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp

  // 如果不到1分钟
  if (diff < 60 * 1000) {
    return "just now"
  }

  // 如果不到1小时
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000))
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
  }

  // 如果不到24小时
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    return `${hours} hour${hours > 1 ? "s" : ""} ago`
  }

  // 如果不到7天
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    return `${days} day${days > 1 ? "s" : ""} ago`
  }

  // 否则显示完整日期
  const date = new Date(timestamp)
  return date.toLocaleDateString()
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

export default function HomePage() {
  const router = useRouter()

  // 所有可用标签
  const [availableTags, setAvailableTags] = useState<Tag[]>([])

  // 笔记本数据
  const [notebooks, setNotebooks] = useState<Notebook[]>([])

  // 笔记数据
  const [notes, setNotes] = useState<Note[]>([])

  const [expandedSections, setExpandedSections] = useState({
    notebooks: true,
    tags: true,
  })

  // 搜索状态
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  // 从localStorage加载数据
  useEffect(() => {
    const loadData = () => {
      console.log('首页开始加载数据...')
      const savedNotes = localStorage.getItem("notes")
      const savedTags = localStorage.getItem("tags")
      const savedNotebooks = localStorage.getItem("notebooks")

      if (savedNotes) {
        const parsedNotes = JSON.parse(savedNotes)
        console.log('从 localStorage 加载的笔记数据:', parsedNotes)
        // 只在数据确实发生变化时更新状态
        if (JSON.stringify(notes) !== JSON.stringify(parsedNotes)) {
          setNotes(parsedNotes)
        }
      } else {
        // 如果没有保存的笔记，创建一个默认笔记本和空笔记列表
        const defaultNotebook = { id: "default", name: "默认笔记本" }
        setNotebooks([defaultNotebook])
        localStorage.setItem("notebooks", JSON.stringify([defaultNotebook]))
        setNotes([])
        localStorage.setItem("notes", JSON.stringify([]))
      }

      if (savedTags) {
        const parsedTags = JSON.parse(savedTags)
        console.log('从 localStorage 加载的标签数据:', parsedTags)
        // 只在数据确实发生变化时更新状态
        if (JSON.stringify(availableTags) !== JSON.stringify(parsedTags)) {
          setAvailableTags(parsedTags)
        }
      } else {
        setAvailableTags([])
        localStorage.setItem("tags", JSON.stringify([]))
      }

      if (savedNotebooks) {
        const parsedNotebooks = JSON.parse(savedNotebooks)
        console.log('从 localStorage 加载的笔记本数据:', parsedNotebooks)
        // 只在数据确实发生变化时更新状态
        if (JSON.stringify(notebooks) !== JSON.stringify(parsedNotebooks)) {
          setNotebooks(parsedNotebooks)
        }
      } else {
        const defaultNotebook = { id: "default", name: "默认笔记本" }
        setNotebooks([defaultNotebook])
        localStorage.setItem("notebooks", JSON.stringify([defaultNotebook]))
      }
    }

    // 初始加载
    loadData()

    // 监听路由变化
    const handleRouteChange = () => {
      console.log('路由变化，重新加载数据...')
      loadData()
    }

    // 添加路由变化监听
    window.addEventListener('popstate', handleRouteChange)

    // 清理函数
    return () => {
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, []) // 移除依赖项，使用事件监听

  // 保存数据到localStorage
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes))
  }, [notes])

  useEffect(() => {
    localStorage.setItem("tags", JSON.stringify(availableTags))
  }, [availableTags])

  useEffect(() => {
    localStorage.setItem("notebooks", JSON.stringify(notebooks))
  }, [notebooks])

  // 统计每个标签的使用次数
  const getTagCounts = () => {
    const counts: Record<string, number> = {}
    notes.forEach((note) => {
      note.tags.forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1
      })
    })
    return counts
  }

  // 统计每个笔记本的笔记数量
  const getNotebookCounts = () => {
    const counts: Record<string, number> = {}
    notes.forEach((note) => {
      counts[note.notebookId] = (counts[note.notebookId] || 0) + 1
    })
    return counts
  }

  const tagCounts = getTagCounts()
  const notebookCounts = getNotebookCounts()

  // 过滤笔记
  const filteredNotes = notes
    .filter((note) => {
      // 如果有搜索查询
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          note.tags.some((tag) => tag.toLowerCase().includes(query))
        )
      }

      // 如果有标签过滤
      if (activeFilter && activeFilter.startsWith("tag:")) {
        const tagName = activeFilter.substring(4)
        return note.tags.includes(tagName)
      }

      // 如果有笔记本过滤
      if (activeFilter && activeFilter.startsWith("notebook:")) {
        const notebookId = activeFilter.substring(9)
        return note.notebookId === notebookId
      }

      // 否则显示所有笔记
      return true
    })
    .sort((a, b) => b.lastUpdated - a.lastUpdated) // 按最后更新时间排序

  const toggleSection = (section: "notebooks" | "tags") => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    })
  }

  // 创建新笔记
  const createNewNote = () => {
    // 确定默认笔记本
    let defaultNotebookId = "default"
    if (activeFilter && activeFilter.startsWith("notebook:")) {
      defaultNotebookId = activeFilter.substring(9)
    }

    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: "新笔记",
      content: "",
      tags: [],
      notebookId: defaultNotebookId,
      timestamp: updateTimestamp(),
      preview: "",
      lastUpdated: Date.now(),
    }

    const updatedNotes = [newNote, ...notes]
    setNotes(updatedNotes)

    // 保存到localStorage
    localStorage.setItem("notes", JSON.stringify(updatedNotes))

    // 导航到编辑页面
    router.push(`/edit/${newNote.id}`)

    // 显示成功提示
    toast({
      title: "已创建新笔记",
      description: "您可以开始编辑新笔记了。",
      duration: 3000,
    })
  }

  // 设置过滤器
  const setFilter = (type: "tag" | "notebook", id: string) => {
    if (type === "tag") {
      const tagName = availableTags.find((tag) => tag.id === id)?.name
      if (tagName) {
        setActiveFilter(`tag:${tagName}`)
        setSearchQuery("")
      }
    } else {
      setActiveFilter(`notebook:${id}`)
      setSearchQuery("")
    }
  }

  // 清除过滤器
  const clearFilter = () => {
    setActiveFilter(null)
    setSearchQuery("")
  }

  // 打开笔记编辑页面
  const openNote = (noteId: string) => {
    router.push(`/edit/${noteId}`)
  }

  return (
    <div className="flex h-screen bg-white">
      {/* 左侧边栏 */}
      <div className="w-64 border-r bg-white p-4 flex flex-col">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">笔记本</h2>
          <div className="space-y-1">
            {notebooks.map((notebook) => (
              <div
                key={notebook.id}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer",
                  activeFilter === `notebook:${notebook.id}`
                    ? "bg-gray-100"
                    : "hover:bg-gray-50"
                )}
                onClick={() => setFilter("notebook", notebook.id)}
              >
                <Folder className="h-4 w-4" />
                <span>{notebook.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">标签</h2>
          <div className="flex flex-wrap gap-1">
            {availableTags.map((tag) => (
              <span
                key={tag.id}
                className={cn(
                  "px-2 py-1 rounded-full text-xs cursor-pointer",
                  activeFilter === `tag:${tag.name}`
                    ? "bg-gray-100 text-gray-800"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                )}
                onClick={() => setFilter("tag", tag.id)}
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 overflow-auto p-6 bg-white">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">我的笔记</h1>
            <div className="flex items-center gap-2">
              <CustomButton onClick={createNewNote} className="flex items-center gap-1">
                <PlusCircle className="h-4 w-4" />
                <span>新建笔记</span>
              </CustomButton>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索笔记..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>
        </div>

        {filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="border rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer relative group"
                onClick={() => openNote(note.id)}
              >
                <h3 className="font-medium text-lg mb-2 pr-8">{note.title}</h3>
                {note.content && (
                  <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                    {note.preview || generatePreview(note.content)}
                  </p>
                )}
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 mb-3">
                    {note.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                    {note.tags.length > 3 && (
                      <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                        +{note.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{notebooks.find((nb) => nb.id === note.notebookId)?.name}</span>
                  <span>{formatDate(note.lastUpdated)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">没有找到笔记</p>
          </div>
        )}
      </div>

      {/* 聊天机器人 */}
      <Chatbot context={notes.map(note => note.content).join('\n\n')} />
    </div>
  )
}

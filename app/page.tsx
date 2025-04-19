"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PlusCircle, ChevronDown, ChevronRight, File, Hash, Search, Folder, FolderPlus, X, Edit } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

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
  const [availableTags, setAvailableTags] = useState<Tag[]>([
    { id: "1", name: "外贸" },
    { id: "2", name: "人工智能" },
    { id: "3", name: "出海" },
    { id: "4", name: "AI技术" },
    { id: "5", name: "企业动态" },
  ])

  // 笔记本数据
  const [notebooks, setNotebooks] = useState<Notebook[]>([
    { id: "default", name: "默认笔记本" },
    { id: "work", name: "工作" },
    { id: "personal", name: "个人" },
  ])

  // 笔记数据
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1111",
      title: "1111",
      content:
        '本文介绍了多家企业的出海动态，如字节跳动和阿里国际加大在人工智能领域的投入、SHEIN在粤港澳智慧产业园的进展，以及多家企业关于海外市场拓展的具体举措。同时，文章还报道了政府机构在国际贸易和科技领域的政策调整，如中国对美国加征关税的税率上调，欧盟关于AI超级工厂的计划等。\n\n...\n\n访问36氪出海网站 letschuhai.com，获取更多全球商业相关资讯。\n\n## 头条大事\n活动 | 中东出海快车道：阿联酋Ajman自由区深圳交流会火热招募中\n\n4月27日，"中东出海快车道：阿联酋 Ajman 自由区深圳交流会"将在深圳举办。本次交流会将搭建一个高效、精准的交流平台，汇聚中阿政商代表、行业专家和众多出海企业，深入解析中东市场的发展潜力，全方位展示 Ajman 自由区作为企业出海战略据点的独特优势，为中国企业本土落地提供满满指引。如果您对中东市场感兴趣，欢迎您扫描下方二维码或点击"此处"填写表单，报名参加本次活动。活动报名将于2025年4月26日中午12:00截止。\n\n## 公司动态\n字节跳动2024年利润增速和利润率下滑，海外收入占比达历史最高\n\n据报道，字节跳动2023年净利润332亿美元，同比增幅仅6%，较2022年大幅下滑。如果人工造雾，字节跳动或将面临投资者的质疑。',
      preview: "本文介绍了多家企业的出海动态，如字节跳动和阿里国际加大在...",
      tags: ["外贸", "人工智能", "出海", "AI技术", "企业动态"],
      notebookId: "work",
      timestamp: "about 17 hours ago",
      lastUpdated: Date.now() - 17 * 60 * 60 * 1000,
    },
    {
      id: "untitled",
      title: "未命名笔记",
      content: "",
      tags: [],
      notebookId: "default",
      timestamp: "about 18 hours ago",
      lastUpdated: Date.now() - 18 * 60 * 60 * 1000,
    },
    {
      id: "111",
      title: "未111",
      content: "dddd2222",
      tags: ["11111"],
      notebookId: "personal",
      timestamp: "about 18 hours ago",
      lastUpdated: Date.now() - 18 * 60 * 60 * 1000,
    },
    {
      id: "2222",
      title: "2222",
      content: "ddd哈哈哈哈",
      tags: ["1111"],
      notebookId: "work",
      timestamp: "about 18 hours ago",
      lastUpdated: Date.now() - 18 * 60 * 60 * 1000,
    },
    {
      id: "AAA",
      title: "AAA",
      content: "111111",
      tags: [],
      notebookId: "personal",
      timestamp: "about 19 hours ago",
      lastUpdated: Date.now() - 19 * 60 * 60 * 1000,
    },
  ])

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
      }

      if (savedTags) {
        const parsedTags = JSON.parse(savedTags)
        console.log('从 localStorage 加载的标签数据:', parsedTags)
        // 只在数据确实发生变化时更新状态
        if (JSON.stringify(availableTags) !== JSON.stringify(parsedTags)) {
          setAvailableTags(parsedTags)
        }
      }

      if (savedNotebooks) {
        const parsedNotebooks = JSON.parse(savedNotebooks)
        console.log('从 localStorage 加载的笔记本数据:', parsedNotebooks)
        // 只在数据确实发生变化时更新状态
        if (JSON.stringify(notebooks) !== JSON.stringify(parsedNotebooks)) {
          setNotebooks(parsedNotebooks)
        }
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
    <div className="flex h-screen bg-white text-gray-900">
      {/* Left Sidebar */}
      <div className="w-64 border-r flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-lg font-medium mb-4">笔记本</h1>
          <CustomButton onClick={createNewNote} className="w-full py-2 px-4 text-sm font-medium">
            <PlusCircle className="h-4 w-4 mr-2" />
            <span>新建笔记</span>
          </CustomButton>
        </div>

        <div className="px-3 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="搜索笔记..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setActiveFilter(null)
              }}
              className="w-full pl-9 pr-3 py-2 rounded-full border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-3">
            <div className="mb-2">
              <button
                className={cn(
                  "flex items-center w-full px-3 py-2 rounded-full transition-colors text-sm",
                  activeFilter === null ? "bg-gray-100" : "hover:bg-gray-100",
                )}
                onClick={clearFilter}
              >
                <File className="h-4 w-4 mr-2" />
                <span>所有笔记</span>
                <span className="ml-auto text-xs text-gray-500">{notes.length}</span>
              </button>
            </div>

            <div className="mb-2">
              <div className="flex items-center justify-between px-2 py-1">
                <button
                  className="flex items-center text-gray-700 hover:text-gray-900"
                  onClick={() => toggleSection("notebooks")}
                >
                  {expandedSections.notebooks ? (
                    <ChevronDown className="h-4 w-4 mr-2" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-2" />
                  )}
                  <Folder className="h-4 w-4 mr-2" />
                  <span>笔记本</span>
                </button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={() => {}} className="p-1 rounded-full hover:bg-gray-100">
                        <FolderPlus className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>新建笔记本</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {expandedSections.notebooks && (
                <div className="ml-6 mt-1 space-y-1">
                  {notebooks.map((notebook) => (
                    <div key={notebook.id} className="flex items-center justify-between group">
                      <button
                        className={cn(
                          "flex items-center text-gray-600 hover:text-gray-900 py-1.5 px-3 rounded-full flex-grow transition-colors text-sm",
                          activeFilter === `notebook:${notebook.id}` && "bg-gray-100",
                        )}
                        onClick={() => setFilter("notebook", notebook.id)}
                      >
                        <span>{notebook.name}</span>
                        <span className="ml-2 text-xs text-gray-500">({notebookCounts[notebook.id] || 0})</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-2">
              <button
                className="flex items-center text-gray-700 hover:text-gray-900 px-2 py-1"
                onClick={() => toggleSection("tags")}
              >
                {expandedSections.tags ? (
                  <ChevronDown className="h-4 w-4 mr-2" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-2" />
                )}
                <Hash className="h-4 w-4 mr-2" />
                <span>标签</span>
              </button>

              {expandedSections.tags && (
                <div className="ml-6 mt-1 space-y-1">
                  {availableTags.map((tag) => (
                    <div key={tag.id} className="flex items-center justify-between group">
                      <button
                        className={cn(
                          "flex items-center text-gray-600 hover:text-gray-900 py-1.5 px-3 rounded-full flex-grow transition-colors text-sm",
                          activeFilter === `tag:${tag.name}` && "bg-gray-100",
                        )}
                        onClick={() => setFilter("tag", tag.id)}
                      >
                        <span>{tag.name}</span>
                        <span className="ml-2 text-xs text-gray-500">({tagCounts[tag.name] || 0})</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Notes Grid */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-medium">
            {activeFilter
              ? activeFilter.startsWith("tag:")
                ? `标签: ${activeFilter.substring(4)}`
                : `笔记本: ${notebooks.find((nb) => nb.id === activeFilter.substring(9))?.name || ""}`
              : searchQuery
                ? `搜索: ${searchQuery}`
                : "所有笔记"}
          </h2>
          {(activeFilter || searchQuery) && (
            <button onClick={clearFilter} className="p-1 rounded-full hover:bg-gray-100">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-auto p-6">
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
                  <button
                    className="absolute top-3 right-3 p-1 rounded-full bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      openNote(note.id)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center text-gray-500">
              <File className="h-16 w-16 mb-4 opacity-30" />
              <p className="text-lg mb-2">没有找到匹配的笔记</p>
              <p className="mb-4">尝试使用不同的搜索词或过滤条件</p>
              <CustomButton onClick={clearFilter} className="px-4 py-2 text-sm">
                清除过滤器
              </CustomButton>
            </div>
          )}
        </div>
      </div>

      {/* 提示消息 */}
      <Toaster />
    </div>
  )
}

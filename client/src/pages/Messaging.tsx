import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

interface Message {
  id: number
  sender: string
  senderRole: 'user' | 'facility'
  content: string
  timestamp: string
  avatar?: string
}

interface Conversation {
  id: number
  facilityName: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

export default function Messaging() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchConversations = async () => {
    setLoading(true)
    try {
      // Mock conversations
      const mockConversations: Conversation[] = [
        {
          id: 1,
          facilityName: 'サンシャイン福祉センター',
          lastMessage: '次の訪問は月曜日の10時でお願いします',
          lastMessageTime: '2025-12-08 14:30',
          unreadCount: 2
        },
        {
          id: 2,
          facilityName: 'ケアホーム山田',
          lastMessage: 'マッチングありがとうございます。詳細についてお話しします。',
          lastMessageTime: '2025-12-07 16:45',
          unreadCount: 0
        },
        {
          id: 3,
          facilityName: 'デイサービス太陽',
          lastMessage: 'お試し利用のご予定はいかがでしょうか',
          lastMessageTime: '2025-12-06 09:15',
          unreadCount: 1
        }
      ]
      setConversations(mockConversations)
    } catch (err) {
      console.error('Failed to fetch conversations:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId: number) => {
    try {
      // Mock messages
      const mockMessages: Message[] = [
        {
          id: 1,
          sender: 'ケアマッチ',
          senderRole: 'facility',
          content: 'マッチングのお申し込みをありがとうございます。',
          timestamp: '2025-12-05 10:00'
        },
        {
          id: 2,
          sender: 'あなた',
          senderRole: 'user',
          content: 'こちらこそ、よろしくお願いします。',
          timestamp: '2025-12-05 10:15'
        },
        {
          id: 3,
          sender: 'ケアマッチ',
          senderRole: 'facility',
          content: '次の訪問は月曜日の10時でお願いします。ご都合はいかがでしょうか？',
          timestamp: '2025-12-08 14:30'
        }
      ]
      setMessages(mockMessages)
    } catch (err) {
      console.error('Failed to fetch messages:', err)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputValue.trim() || !selectedConversation) return

    try {
      const newMessage: Message = {
        id: messages.length + 1,
        sender: 'あなた',
        senderRole: 'user',
        content: inputValue,
        timestamp: new Date().toLocaleString('ja-JP')
      }

      setMessages([...messages, newMessage])
      setInputValue('')

      // Call API
      await axios.post(
        '/api/messages',
        {
          conversation_id: selectedConversation,
          content: inputValue
        },
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch(() => {
        // Mock success
        console.log('Mock message sent')
      })
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }

  if (loading) {
    return <div className="messaging-container">読み込み中...</div>
  }

  return (
    <div className="messaging-container">
      <div className="conversations-list">
        <h3>メッセージ</h3>
        {conversations.map(conv => (
          <div
            key={conv.id}
            className={`conversation-item ${selectedConversation === conv.id ? 'active' : ''}`}
            onClick={() => setSelectedConversation(conv.id)}
          >
            <div className="conversation-header">
              <h4>{conv.facilityName}</h4>
              {conv.unreadCount > 0 && (
                <span className="unread-badge">{conv.unreadCount}</span>
              )}
            </div>
            <p className="conversation-preview">{conv.lastMessage}</p>
            <span className="conversation-time">{conv.lastMessageTime}</span>
          </div>
        ))}
      </div>

      <div className="message-thread">
        {selectedConversation ? (
          <>
            <div className="thread-header">
              <h3>
                {conversations.find(c => c.id === selectedConversation)?.facilityName}
              </h3>
            </div>

            <div className="messages-container">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`message ${msg.senderRole === 'user' ? 'sent' : 'received'}`}
                >
                  <div className="message-bubble">
                    <p className="message-content">{msg.content}</p>
                    <span className="message-time">{msg.timestamp}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form className="message-input-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                className="message-input"
                placeholder="メッセージを入力..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
              />
              <button type="submit" className="send-button">
                送信
              </button>
            </form>
          </>
        ) : (
          <div className="no-conversation">
            <p>メッセージスレッドを選択してください</p>
          </div>
        )}
      </div>
    </div>
  )
}

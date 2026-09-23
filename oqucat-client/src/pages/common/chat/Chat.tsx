import Paper from '@mui/material/Paper'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { authClient } from '@/auth/betterAuth'
import { useUser } from '@/context/user/useUser'

import { activeChatEvent, createChatAdapter, isUserId } from './chatAdapter'
import ChatContent from './ChatContent'
import ChatStatus from './ChatStatus'

const Chat = () => {
  const { data } = authClient.useSession()
  const { setUnreadCount, sio } = useUser()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryChat = searchParams.get('chat')
  const [isTyping, setIsTyping] = useState(false)
  const [isOnline, setIsOnline] = useState(false)
  const activeConversationId =
    queryChat && isUserId(queryChat) ? queryChat : undefined
  const user = data?.user
  const adapter = useMemo(
    () =>
      sio && user
        ? createChatAdapter(
            sio,
            user.id,
            user.image,
            setIsTyping,
            setIsOnline,
            (count) => setUnreadCount((current) => Math.max(0, current - count))
          )
        : null,
    [setIsOnline, setIsTyping, setUnreadCount, sio, user]
  )

  useEffect(
    () => () => {
      globalThis.dispatchEvent(
        new CustomEvent(activeChatEvent, { detail: null })
      )
    },
    []
  )

  if (!user || !adapter) {
    return null
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        height: {
          xs: activeConversationId
            ? 'calc(100dvh - var(--safe-top) - var(--safe-bottom))'
            : 'calc(100dvh - 56px)',
          md: 'calc(100vh - 160px)',
        },
        pt: 'var(--safe-top)',
        minHeight: 420,
        overflow: 'hidden',
        zIndex: activeConversationId ? 10 : 1,
        position: 'relative',
      }}
    >
      {activeConversationId && (
        <ChatStatus isOnline={isOnline} isTyping={isTyping} />
      )}
      <ChatContent
        activeConversationId={activeConversationId}
        adapter={adapter}
        user={user}
        onActiveConversationChange={(conversationId) => {
          setSearchParams(
            (current) => {
              if (conversationId && isUserId(conversationId)) {
                current.set('chat', conversationId)
              } else {
                current.delete('chat')
              }
              return current
            },
            { replace: true }
          )
          setIsTyping(false)
          setIsOnline(false)
        }}
      />
    </Paper>
  )
}

export default Chat

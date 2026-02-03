<script setup lang="ts">
import { ref, nextTick, onMounted } from "vue";
import { User, Service, Promotion } from '@element-plus/icons-vue';

// 接收父组件传递的窗口高度
const props = defineProps<{
    height: number;
}>();

interface Message {
    id: number;
    text: string;
    isUser: boolean;
    timestamp: string;
}

const messages = ref<Message[]>([
    {
        id: 1,
        text: "Hello! I'm your AI coding assistant. How can I help you today?",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
]);

const inputValue = ref("");
const scrollbarRef = ref<HTMLElement | null>(null);
const isTyping = ref(false);

const scrollToBottom = async () => {
    await nextTick();
    if (scrollbarRef.value) {
        scrollbarRef.value.scrollTop = scrollbarRef.value.scrollHeight;
    }
};

const sendMessage = async () => {
    if (!inputValue.value.trim()) return;

    // Add user message
    messages.value.push({
        id: Date.now(),
        text: inputValue.value,
        isUser: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    const userInput = inputValue.value;
    inputValue.value = "";
    scrollToBottom();

    // Simulate AI response
    isTyping.value = true;

    // Simulate thinking delay
    setTimeout(() => {
        isTyping.value = false;
        messages.value.push({
            id: Date.now() + 1,
            text: `I received your message: "${userInput}". \n\nI am a simulated agent response pending actual backend integration. I can help with Vue composition API, Tauri commands, and styling!`,
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        scrollToBottom();
    }, 1500);
};

// Handle Enter key (Shift+Enter for new line)
const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
};

onMounted(() => {
    scrollToBottom();
});
</script>

<template>
    <div class="agent-container">
        <!-- Header -->
        <div class="agent-header">
            <div class="header-title">
                <el-icon class="app-icon">
                    <Service />
                </el-icon>
                <span>AI Assistant</span>
            </div>
            <div class="header-actions">
                <!-- Add actions like Clear Chat here if needed -->
            </div>
        </div>

        <!-- Chat Area -->
        <div class="chat-area" ref="scrollbarRef" :style="{ maxHeight: props.height + 'px' }">
            <div v-for="msg in messages" :key="msg.id" class="message-wrapper"
                :class="{ 'user-direction': msg.isUser, 'ai-direction': !msg.isUser }">
                <div class="avatar">
                    <el-icon v-if="msg.isUser">
                        <User />
                    </el-icon>
                    <el-icon v-else class="ai-icon">
                        <Service />
                    </el-icon>
                </div>
                <div class="message-content">
                    <div class="bubble" :class="{ 'user-bubble': msg.isUser, 'ai-bubble': !msg.isUser }">
                        <div class="message-text">{{ msg.text }}</div>
                    </div>
                    <div class="timestamp">{{ msg.timestamp }}</div>
                </div>
            </div>

            <!-- Typing Indicator -->
            <div v-if="isTyping" class="message-wrapper ai-direction">
                <div class="avatar">
                    <el-icon class="ai-icon">
                        <Service />
                    </el-icon>
                </div>
                <div class="message-content">
                    <div class="bubble ai-bubble typing-bubble">
                        <span class="dot"></span>
                        <span class="dot"></span>
                        <span class="dot"></span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Input Area -->
        <div class="input-area">
            <div class="input-wrapper">
                <textarea v-model="inputValue" placeholder="Ask anything..." class="chat-input" rows="1"
                    @keydown="handleKeydown"></textarea>
                <button class="send-btn" @click="sendMessage" :disabled="!inputValue.trim()">
                    <el-icon>
                        <Promotion />
                    </el-icon>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.agent-container {
    display: flex;
    flex-direction: column;
    /* background-color: #1e1e1e; */
    /* VS Code Sidebar Color */
    color: var(--el-text-color-regular);
    font-family: 'Segoe UI', sans-serif;
    /* border-left: 1px solid #333; */
    overflow: hidden;
    height: 100%;
}

.agent-header {
    padding: 10px 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--el-border-color-dark);
    /* background-color: #252526; */
    height: 12px;
    flex-shrink: 0;
}

.header-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--el-text-color-primary);
}

.app-icon {
    font-size: 16px;
    color: var(--el-color-primary);
}

/* Chat Area */
.chat-area {
    flex: 1;
    overflow-y: auto;
    padding: 15px 10px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    scroll-behavior: smooth;
    min-height: 0;
    max-height: 200px;
}

/* Scrollbar Styling */
.chat-area::-webkit-scrollbar {
    width: 6px;
}

.chat-area::-webkit-scrollbar-track {
    background: transparent;
}

.chat-area::-webkit-scrollbar-thumb {
    background-color: var(--el-text-color-disabled);
    border-radius: 3px;
}

.chat-area::-webkit-scrollbar-thumb:hover {
    background-color: var(--el-text-color-secondary);
}

.message-wrapper {
    display: flex;
    gap: 8px;
    max-width: 100%;
}

.user-direction {
    flex-direction: row-reverse;
}

.avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    /* background-color: #333; */
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 2px;
    background-color: var(--el-color-primary-light-5);
}

.user-direction .avatar {
    /* background-color: var(--el-color-primary); */
    /* VS Code Blue */
}

.ai-icon {
    color: var(--el-color-primary);
}

.message-content {
    display: flex;
    flex-direction: column;
    max-width: 85%;
}

.user-direction .message-content {
    align-items: flex-end;
}

.bubble {
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 13px;
    line-height: 1.4;
    word-wrap: break-word;
    white-space: pre-wrap;
    position: relative;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.ai-bubble {
    /* background-color: #2b2b2b; */
    background-color: var(--el-fill-color-darker);
    color: var(--el-text-color-primary);
    border-top-left-radius: 2px;
}

.user-bubble {
    background-color: var(--el-color-primary);
    color: #ffffff;
    border-top-right-radius: 2px;
}

.timestamp {
    font-size: 10px;
    color: var(--el-text-color-secondary);
    margin-top: 4px;
    padding: 0 2px;
}

/* Typing Animation */
.typing-bubble {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 12px 14px;
}

.dot {
    width: 6px;
    height: 6px;
    background-color: var(--el-text-color-secondary);
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) {
    animation-delay: -0.32s;
}

.dot:nth-child(2) {
    animation-delay: -0.16s;
}

@keyframes bounce {

    0%,
    80%,
    100% {
        transform: scale(0);
    }

    40% {
        transform: scale(1);
    }
}

/* Input Area */
.input-area {
    padding: 12px;
    /* background-color: #1e1e1e; */
    border-top: 1px solid var(--el-border-color-dark);
    flex-shrink: 0;
}

.input-wrapper {
    display: flex;
    align-items: flex-end;
    /* background-color: #2b2b2b; */
    /* Input Background */
    border: 1px solid var(--el-border-color);
    border-radius: 6px;
    padding: 6px 8px;
    transition: border-color 0.2s;
}

.input-wrapper:focus-within {
    border-color: var(--el-color-primary);
    /* Focus border color */
}

.chat-input {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--el-text-color-primary);
    font-family: inherit;
    font-size: 13px;
    line-height: 1.4;
    resize: none;
    outline: none;
    max-height: 100px;
    min-height: 20px;
    padding: 4px 0;
}

.send-btn {
    background: transparent;
    border: none;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    margin-left: 6px;
    width: 28px;
    height: 28px;
}

.send-btn:hover:not(:disabled) {
    background-color: var(--el-color-primary);
    color: white;
}

.send-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.message-text {
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    /* Code-like font for Antigravity feel */
    font-size: 12px;
}
</style>
package marketplace.nilrow.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import marketplace.nilrow.domain.channel.ChannelDTO;
import marketplace.nilrow.domain.chat.ChatConversation;
import marketplace.nilrow.domain.chat.ChatMessage;
import marketplace.nilrow.domain.channel.Channel;
import marketplace.nilrow.domain.people.People;
import marketplace.nilrow.domain.user.User;
import marketplace.nilrow.services.ChatService;
import marketplace.nilrow.services.ChannelService;
import marketplace.nilrow.repositories.PeopleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/chats")
@Tag(name = "Chat", description = "Operações relacionadas ao chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private ChannelService channelService;

    @Autowired
    private PeopleRepository peopleRepository;

    @PostMapping("/start/{channelId}")
    public ResponseEntity<ChatMessage> startConversation(@PathVariable String channelId, @RequestBody String content) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userDetails;
        People people = peopleRepository.findByUser(user);
        Channel channel = channelService.getChannel(channelId).orElseThrow(() -> new IllegalArgumentException("Channel not found"));
        ChatConversation conversation = chatService.createConversation(channel, people);
        ChatMessage message = chatService.sendMessage(conversation, people, content);
        return ResponseEntity.ok(message);
    }

    @PostMapping("/send/{conversationId}")
    public ResponseEntity<ChatMessage> sendMessage(@PathVariable String conversationId, @RequestBody String content) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userDetails;
        People people = peopleRepository.findByUser(user);
        ChatConversation conversation = chatService.getConversation(conversationId).orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        ChatMessage message = chatService.sendMessage(conversation, people, content);
        return ResponseEntity.ok(message);
    }

    @DeleteMapping("/message/{messageId}")
    public ResponseEntity<Void> deleteMessage(@PathVariable String messageId) {
        chatService.deleteMessage(messageId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/message/{messageId}")
    public ResponseEntity<ChatMessage> editMessage(@PathVariable String messageId, @RequestBody String newContent) {
        chatService.editMessage(messageId, newContent);
        ChatMessage message = chatService.getMessage(messageId).orElseThrow(() -> new IllegalArgumentException("Message not found"));
        return ResponseEntity.ok(message);
    }

    @DeleteMapping("/conversation/{conversationId}")
    public ResponseEntity<Void> deleteConversation(@PathVariable String conversationId) {
        chatService.deleteConversation(conversationId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/new-messages/{conversationId}")
    public ResponseEntity<Long> countNewMessages(@PathVariable String conversationId) {
        ChatConversation conversation = chatService.getConversation(conversationId).orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        long newMessagesCount = chatService.countNewMessages(conversation);
        return ResponseEntity.ok(newMessagesCount);
    }

    @PutMapping("/message/seen/{messageId}")
    public ResponseEntity<Void> markMessageAsSeen(@PathVariable String messageId) {
        chatService.markMessageAsSeen(messageId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/channels")
    public ResponseEntity<List<ChannelDTO>> getAllChannels() {
        List<Channel> channels = chatService.getAllChannels();
        List<ChannelDTO> channelDTOs = channels.stream()
                .map(channel -> new ChannelDTO(channel))
                .collect(Collectors.toList());
        return ResponseEntity.ok(channelDTOs);
    }

    @PutMapping("/block/{conversationId}")
    public ResponseEntity<Void> blockChannel(@PathVariable String conversationId) {
        ChatConversation conversation = chatService.getConversation(conversationId).orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        chatService.blockChannel(conversation);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/disable/{conversationId}")
    public ResponseEntity<Void> disableChat(@PathVariable String conversationId) {
        ChatConversation conversation = chatService.getConversation(conversationId).orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        chatService.disableChat(conversation);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/notifications")
    public ResponseEntity<String> getChatNotifications() {
        // Lógica para retornar notificações de chat
        return ResponseEntity.ok("Notificações de chat");
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ChatConversation>> getConversationsByUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userDetails;
        People people = peopleRepository.findByUser(user);
        List<ChatConversation> conversations = chatService.getConversationsByPeople(people);
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/conversation/{conversationId}/messages")
    public ResponseEntity<List<ChatMessage>> getMessagesByConversation(@PathVariable String conversationId) {
        ChatConversation conversation = chatService.getConversation(conversationId).orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        List<ChatMessage> messages = chatService.getMessagesByConversation(conversation);
        return ResponseEntity.ok(messages);
    }

    @PutMapping("/conversation/{conversationId}/messages/read")
    public ResponseEntity<Void> markMessagesAsRead(@PathVariable String conversationId) {
        ChatConversation conversation = chatService.getConversation(conversationId).orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        chatService.markMessagesAsRead(conversation);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/conversation/{conversationId}/mute")
    public ResponseEntity<Void> muteConversation(@PathVariable String conversationId) {
        ChatConversation conversation = chatService.getConversation(conversationId).orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        chatService.muteConversation(conversation);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/conversation/{conversationId}/messages/search")
    public ResponseEntity<List<ChatMessage>> searchMessages(@PathVariable String conversationId, @RequestParam String query) {
        ChatConversation conversation = chatService.getConversation(conversationId).orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        List<ChatMessage> messages = chatService.searchMessages(conversation, query);
        return ResponseEntity.ok(messages);
    }
}

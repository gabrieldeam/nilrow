package marketplace.nilrow.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import marketplace.nilrow.domain.channel.ChannelDTO;
import marketplace.nilrow.domain.channel.SimpleChannelDTO;
import marketplace.nilrow.domain.chat.*;
import marketplace.nilrow.domain.channel.Channel;
import marketplace.nilrow.domain.people.People;
import marketplace.nilrow.domain.user.User;
import marketplace.nilrow.services.ChatService;
import marketplace.nilrow.services.ChannelService;
import marketplace.nilrow.repositories.PeopleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<ChatConversationDTO> startConversation(@PathVariable String channelId) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userDetails;
        People people = peopleRepository.findByUser(user);
        Channel channel = channelService.getChannel(channelId).orElseThrow(() -> new IllegalArgumentException("Channel not found"));

        ChatConversation conversation = chatService.startConversation(channel, people);
        ChatConversationDTO conversationDTO = new ChatConversationDTO(conversation);

        return ResponseEntity.ok(conversationDTO);
    }

    @PostMapping("/send/{conversationId}")
    public ResponseEntity<ChatMessageDTO> sendMessage(@PathVariable String conversationId, @RequestBody String content) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userDetails;
        People people = peopleRepository.findByUser(user);
        ChatConversation conversation = chatService.getConversation(conversationId).orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        // Identificar se o remetente é uma pessoa ou um canal
        Object sender;
        if (conversation.getPeople().equals(people)) {
            sender = people;
        } else if (conversation.getChannel().getPeople().equals(people)) {
            sender = conversation.getChannel();
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // Não autorizado
        }

        ChatMessage message = chatService.sendMessage(conversation, sender, content);
        String senderType = sender instanceof People ? "PEOPLE" : "CHANNEL";
        ChatMessageDTO messageDTO = new ChatMessageDTO(message, senderType);

        return ResponseEntity.ok(messageDTO);
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
    public ResponseEntity<List<SimpleChannelDTO>> getChannels() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userDetails;
        People people = peopleRepository.findByUser(user);

        List<Channel> allChannels = chatService.getAllChannels();
        List<Channel> channelsWithConversations = chatService.getChannelsWithConversations(people);

        List<Channel> availableChannels = allChannels.stream()
                .filter(channel -> !channelsWithConversations.contains(channel))
                .collect(Collectors.toList());

        List<SimpleChannelDTO> channelDTOs = availableChannels.stream()
                .map(SimpleChannelDTO::new)
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
    public ResponseEntity<List<ConversationChannelDTO>> getConversationsByUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userDetails;
        People people = peopleRepository.findByUser(user);
        List<ChatConversation> conversations = chatService.getConversationsByPeople(people);

        List<ConversationChannelDTO> conversationDTOs = conversations.stream()
                .map(conversation -> new ConversationChannelDTO(conversation))
                .collect(Collectors.toList());

        return ResponseEntity.ok(conversationDTOs);
    }

    @GetMapping("/conversations/channel")
    public ResponseEntity<List<ConversationPeopleDTO>> getConversationsByChannel() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userDetails;
        People people = peopleRepository.findByUser(user);
        Channel userChannel = channelService.getChannelByPeople(people).orElseThrow(() -> new IllegalArgumentException("Channel not found"));

        List<ChatConversation> conversations = chatService.getConversationsByChannel(userChannel);

        List<ConversationPeopleDTO> conversationDTOs = conversations.stream()
                .map(conversation -> new ConversationPeopleDTO(conversation))
                .collect(Collectors.toList());

        return ResponseEntity.ok(conversationDTOs);
    }

    @GetMapping("/conversation/{conversationId}/messages")
    public ResponseEntity<List<ChatMessageDTO>> getMessagesByConversation(@PathVariable String conversationId) {
        ChatConversation conversation = chatService.getConversation(conversationId).orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        List<ChatMessage> messages = chatService.getMessagesByConversation(conversation);

        List<ChatMessageDTO> messageDTOs = messages.stream()
                .map(message -> {
                    String senderType = message.getSender() instanceof People ? "PEOPLE" : "CHANNEL";
                    return new ChatMessageDTO(message, senderType);
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(messageDTOs);
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

package marketplace.nilrow.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
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
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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

    @PostMapping("/send/{conversationId}")
    public ResponseEntity<?> sendMessage(@PathVariable String conversationId, @RequestParam String content) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userDetails;
        People people = peopleRepository.findByUser(user);
        ChatConversation conversation = chatService.getConversation(conversationId).orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        if (conversation.isBlocked()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Esta conversa está bloqueada. Você não pode enviar mensagens.");
        }

        // Identificar se o remetente é uma pessoa ou um canal
        Object sender;
        if (conversation.getPeople().equals(people)) {
            sender = people;
        } else if (conversation.getChannel().getPeople().equals(people)) {
            sender = conversation.getChannel();
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Você não está autorizado a enviar mensagens nesta conversa.");
        }

        // Definindo o contentType como "text"
        String contentType = "text";

        ChatMessage message = chatService.sendMessage(conversation, sender, content, contentType);
        String senderType = sender instanceof People ? "PEOPLE" : "CHANNEL";
        boolean isSender = sender.equals(people) || (sender instanceof Channel && ((Channel) sender).getPeople().equals(people));
        ChatMessageDTO messageDTO = new ChatMessageDTO(message, senderType, isSender);

        return ResponseEntity.ok(messageDTO);
    }

    @PostMapping("/start/{channelId}")
    public ResponseEntity<ChatConversationDTO> startConversation(@PathVariable String channelId, @RequestBody(required = false) String initialMessage) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userDetails;
        People people = peopleRepository.findByUser(user);
        Channel channel = channelService.getChannel(channelId).orElseThrow(() -> new IllegalArgumentException("Channel not found"));

        ChatConversation conversation = chatService.startConversation(channel, people);

        if (initialMessage != null && !initialMessage.trim().isEmpty()) {
            chatService.sendMessage(conversation, people, initialMessage, "text");
        }

        ChatConversationDTO conversationDTO = new ChatConversationDTO(conversation);
        return ResponseEntity.ok(conversationDTO);
    }


    @PostMapping("/send-image/{conversationId}")
    public ResponseEntity<ChatMessageDTO> sendImage(@PathVariable String conversationId, @RequestParam("image") MultipartFile imageFile) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userDetails;
        People people = peopleRepository.findByUser(user);

        ChatConversation conversation = chatService.getConversation(conversationId).orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        String imageUrl = chatService.saveFile(imageFile);

        ChatMessage message = chatService.sendMessage(conversation, people, imageUrl, "image");
        String senderType = "PEOPLE";
        boolean isSender = message.getSenderPeople() != null && message.getSenderPeople().equals(people);
        ChatMessageDTO messageDTO = new ChatMessageDTO(message, senderType, isSender);

        return ResponseEntity.ok(messageDTO);
    }

    @PostMapping("/send-file/{conversationId}")
    public ResponseEntity<ChatMessageDTO> sendFile(@PathVariable String conversationId, @RequestParam("file") MultipartFile file) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userDetails;
        People people = peopleRepository.findByUser(user);

        ChatConversation conversation = chatService.getConversation(conversationId).orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        String fileUrl = chatService.saveFile(file);

        ChatMessage message = chatService.sendMessage(conversation, people, fileUrl, "file");
        String senderType = "PEOPLE";
        boolean isSender = message.getSenderPeople() != null && message.getSenderPeople().equals(people);
        ChatMessageDTO messageDTO = new ChatMessageDTO(message, senderType, isSender);

        return ResponseEntity.ok(messageDTO);
    }

    @DeleteMapping("/message/{messageId}")
    public ResponseEntity<Void> deleteMessage(@PathVariable String messageId) {
        // Recupere a mensagem do banco de dados
        ChatMessage message = chatService.getMessageById(messageId).orElseThrow(() -> new IllegalArgumentException("Message not found"));

        // Verifique se o contentType é "image"
        if ("image".equals(message.getContentType())) {
            // Delete o arquivo de imagem do diretório de uploads
            try {
                Path imagePath = Paths.get(message.getContent());
                Files.deleteIfExists(imagePath);
            } catch (Exception e) {
                // Log ou trate o erro conforme necessário
                e.printStackTrace();
            }
        }

        // Delete a mensagem do banco de dados
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
        // Recuperar o usuário autenticado
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userDetails;
        People people = peopleRepository.findByUser(user);

        // Recuperar a conversa
        ChatConversation conversation = chatService.getConversation(conversationId).orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        // Contar as novas mensagens recebidas pelo usuário
        long newMessagesCount = chatService.countNewMessagesForUser(conversation, people);

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
    public ResponseEntity<String> toggleBlockChannel(@PathVariable String conversationId) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userDetails;
        People requester = peopleRepository.findByUser(user);

        ChatConversation conversation = chatService.getConversation(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        try {
            boolean isBlocked = chatService.toggleBlockChannel(conversation, requester);
            String message = isBlocked ? "Chat bloqueado com sucesso" : "Chat desbloqueado com sucesso";
            return ResponseEntity.ok(message);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @GetMapping("/block-status/{conversationId}")
    public ResponseEntity<Boolean> getBlockStatus(@PathVariable String conversationId) {
        ChatConversation conversation = chatService.getConversation(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        return ResponseEntity.ok(conversation.isBlocked());
    }


    @GetMapping("/conversation/{conversationId}/is-blocked-by-me")
    public ResponseEntity<Boolean> isConversationBlockedByMe(@PathVariable String conversationId) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userDetails;
        People requester = peopleRepository.findByUser(user);

        ChatConversation conversation = chatService.getConversation(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        boolean isBlockedByMe = conversation.getBlockedBy() != null && conversation.getBlockedBy().equals(requester);

        return ResponseEntity.ok(isBlockedByMe);
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
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userDetails;
        People people = peopleRepository.findByUser(user);

        ChatConversation conversation = chatService.getConversation(conversationId).orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        List<ChatMessage> messages = chatService.getMessagesByConversation(conversation);

        List<ChatMessageDTO> messageDTOs = messages.stream()
                .map(message -> {
                    String senderType = message.getSender() instanceof People ? "PEOPLE" : "CHANNEL";
                    boolean isSender = message.getSender() != null && (message.getSender().equals(people) || (message.getSender() instanceof Channel && ((Channel) message.getSender()).getPeople().equals(people)));
                    return new ChatMessageDTO(message, senderType, isSender);
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
    public ResponseEntity<String> toggleMuteConversation(@PathVariable String conversationId) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userDetails;
        People requester = peopleRepository.findByUser(user);

        ChatConversation conversation = chatService.getConversation(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        chatService.toggleMuteConversation(conversation, requester);
        boolean isMuted = chatService.isConversationMutedByUser(conversation, requester);
        String message = isMuted ? "Chat silenciado com sucesso" : "Chat não está mais silenciado";

        return ResponseEntity.ok(message);
    }

    @GetMapping("/conversation/{conversationId}/is-muted-by-me")
    public ResponseEntity<Boolean> isConversationMutedByMe(@PathVariable String conversationId) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userDetails;
        People requester = peopleRepository.findByUser(user);

        ChatConversation conversation = chatService.getConversation(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        boolean isMutedByMe = chatService.isConversationMutedByUser(conversation, requester);

        return ResponseEntity.ok(isMutedByMe);
    }

    @GetMapping("/conversation/{conversationId}/messages/search")
    public ResponseEntity<List<ChatMessage>> searchMessages(@PathVariable String conversationId, @RequestParam String query) {
        ChatConversation conversation = chatService.getConversation(conversationId).orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        List<ChatMessage> messages = chatService.searchMessages(conversation, query);
        return ResponseEntity.ok(messages);
    }

}

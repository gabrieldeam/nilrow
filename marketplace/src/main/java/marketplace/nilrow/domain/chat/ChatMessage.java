package marketplace.nilrow.domain.chat;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import marketplace.nilrow.domain.channel.Channel;
import marketplace.nilrow.domain.people.People;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "conversation_id", nullable = false)
    private ChatConversation conversation;

    @ManyToOne
    @JoinColumn(name = "sender_people_id", nullable = true)
    private People senderPeople;

    @ManyToOne
    @JoinColumn(name = "sender_channel_id", nullable = true)
    private Channel senderChannel;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private LocalDateTime sentAt;

    private boolean seen;

    @Column(name = "content_type", nullable = false)
    private String contentType;

    public ChatMessage(ChatConversation conversation, People senderPeople, String content, LocalDateTime sentAt, boolean seen, String contentType) {
        this.conversation = conversation;
        this.senderPeople = senderPeople;
        this.content = content;
        this.sentAt = sentAt;
        this.seen = seen;
        this.contentType = contentType;
    }

    public ChatMessage(ChatConversation conversation, Channel senderChannel, String content, LocalDateTime sentAt, boolean seen, String contentType) {
        this.conversation = conversation;
        this.senderChannel = senderChannel;
        this.content = content;
        this.sentAt = sentAt;
        this.seen = seen;
        this.contentType = contentType;
    }

    @Transient
    public Object getSender() {
        return senderPeople != null ? senderPeople : senderChannel;
    }
}

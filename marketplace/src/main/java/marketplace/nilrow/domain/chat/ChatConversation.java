package marketplace.nilrow.domain.chat;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import marketplace.nilrow.domain.channel.Channel;
import marketplace.nilrow.domain.people.People;

import java.util.List;

@Entity
@Table(name = "chat_conversations")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "messages"})
public class ChatConversation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "channel_id", nullable = false)
    private Channel channel;

    @ManyToOne
    @JoinColumn(name = "people_id", nullable = false)
    private People people;

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChatMessage> messages;

    private boolean blocked;

    private boolean chatDisabled;

    private boolean muted;  // Adicionando a propriedade muted
}

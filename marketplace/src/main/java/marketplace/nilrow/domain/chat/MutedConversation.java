package marketplace.nilrow.domain.chat;

import jakarta.persistence.*;
import lombok.*;
import marketplace.nilrow.domain.people.People;

@Entity
@Table(name = "muted_conversations")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class MutedConversation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "conversation_id", nullable = false)
    private ChatConversation conversation;

    @ManyToOne
    @JoinColumn(name = "people_id", nullable = false)
    private People people;
}

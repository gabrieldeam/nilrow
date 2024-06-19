package marketplace.nilrow.domain.follow;

import jakarta.persistence.*;
import lombok.*;
import marketplace.nilrow.domain.channel.Channel;
import marketplace.nilrow.domain.people.People;

@Entity
@Table(name = "follows")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class Follow {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "follower_id", nullable = false)
    private People follower; // Conexão com a entidade People para o seguidor

    @ManyToOne
    @JoinColumn(name = "channel_id", nullable = false)
    private Channel channel; // Conexão com a entidade Channel para o canal seguido
}

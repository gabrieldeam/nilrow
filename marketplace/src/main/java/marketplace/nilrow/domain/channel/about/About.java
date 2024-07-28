package marketplace.nilrow.domain.channel.about;

import jakarta.persistence.*;
import lombok.*;
import marketplace.nilrow.domain.channel.Channel;

import java.util.List;

@Entity
@Table(name = "about")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class About {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "channel_id", nullable = false)
    private Channel channel;

    @Column(columnDefinition = "TEXT")
    private String aboutText;

    @OneToMany(mappedBy = "about", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FAQ> faqs;

    @Column(columnDefinition = "TEXT")
    private String storePolicies;

    @Column(columnDefinition = "TEXT")
    private String exchangesAndReturns;

    @Column(columnDefinition = "TEXT")
    private String additionalInfo;
}
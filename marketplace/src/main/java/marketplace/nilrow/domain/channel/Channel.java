package marketplace.nilrow.domain.channel;

import jakarta.persistence.*;
import lombok.*;
import marketplace.nilrow.domain.people.People;

@Entity
@Table(name = "channels")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class Channel {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column
    private String biography;

    @Column
    private String externalLink;

    @Column
    private String imageUrl;

    @OneToOne
    @JoinColumn(name = "people_id", nullable = false, unique = true)
    private People people;

    public Channel(String name, String biography, String externalLink, String imageUrl, People people) {
        this.name = name;
        this.biography = biography;
        this.externalLink = externalLink;
        this.imageUrl = imageUrl;
        this.people = people;
    }
}

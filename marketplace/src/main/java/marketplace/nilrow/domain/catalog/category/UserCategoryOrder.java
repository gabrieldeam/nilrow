package marketplace.nilrow.domain.catalog.category;

import jakarta.persistence.*;
import lombok.*;
import marketplace.nilrow.domain.people.People;
import marketplace.nilrow.domain.user.User;

@Entity
@Table(name = "user_category_order")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class UserCategoryOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "people_id", nullable = false)
    private People people;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false)
    private int displayOrder;
}

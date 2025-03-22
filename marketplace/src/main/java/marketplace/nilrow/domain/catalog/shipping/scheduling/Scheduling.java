package marketplace.nilrow.domain.catalog.shipping.scheduling;

import jakarta.persistence.*;
import lombok.*;
import marketplace.nilrow.domain.catalog.Catalog;

import java.util.List;

@Entity
@Table(name = "scheduling")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class Scheduling {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "catalog_id", nullable = false)
    private Catalog catalog;

    @Column(nullable = false)
    private boolean active;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShippingMode shippingMode;

    /**
     * Relação com os intervalos de agendamento (horários) pertencentes a este Scheduling.
     * - cascade = ALL: operações de persistência serão propagadas para os intervalos.
     * - orphanRemoval = true: se remover um intervalo da lista e salvar, ele será excluído do banco.
     */
    @OneToMany(mappedBy = "scheduling", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SchedulingInterval> intervals;
}

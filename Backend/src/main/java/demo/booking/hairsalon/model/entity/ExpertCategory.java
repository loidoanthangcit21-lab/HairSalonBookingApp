package demo.booking.hairsalon.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(
    name = "expert_categories",
    indexes = {
        @Index(name = "idx_expert_categories_expert_id", columnList = "expert_id"),
        @Index(name = "idx_expert_categories_category_id", columnList = "category_id")
    }
)
public class ExpertCategory {
    @EmbeddedId
    private ExpertCategoryId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("expertId")
    @JoinColumn(name = "expert_id", nullable = false)
    private Expert expert;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("categoryId")
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}

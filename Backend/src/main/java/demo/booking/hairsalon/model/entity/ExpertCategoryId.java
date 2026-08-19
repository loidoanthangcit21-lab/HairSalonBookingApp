package demo.booking.hairsalon.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpertCategoryId implements Serializable {
    @Column(name = "expert_id")
    private UUID expertId;

    @Column(name = "category_id")
    private UUID categoryId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ExpertCategoryId that = (ExpertCategoryId) o;
        return Objects.equals(expertId, that.expertId) && Objects.equals(categoryId, that.categoryId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(expertId, categoryId);
    }
}

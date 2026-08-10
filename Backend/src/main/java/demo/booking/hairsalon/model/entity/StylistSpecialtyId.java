package demo.booking.hairsalon.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode
@Embeddable
public class StylistSpecialtyId implements Serializable {

    @Column(name = "stylist_id")
    private UUID stylistId;

    @Column(name = "specialty_id")
    private UUID specialtyId;
}

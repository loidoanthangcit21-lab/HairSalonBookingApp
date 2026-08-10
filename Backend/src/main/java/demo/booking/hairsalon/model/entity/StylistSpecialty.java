package demo.booking.hairsalon.model.entity;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "stylist_specialty")
public class StylistSpecialty {

    @EmbeddedId
    private StylistSpecialtyId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("stylistId")
    @JoinColumn(name = "stylist_id")
    private Stylist stylist;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("specialtyId")
    @JoinColumn(name = "specialty_id")
    private Specialty specialty;
}

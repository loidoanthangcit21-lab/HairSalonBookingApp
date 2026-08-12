package demo.booking.hairsalon.service;

import demo.booking.hairsalon.model.dto.response.StylistResponse;

import java.util.List;
import java.util.UUID;

public interface StylistService {
    List<StylistResponse> getAllStylists();
    StylistResponse getStylistById(UUID id);
}

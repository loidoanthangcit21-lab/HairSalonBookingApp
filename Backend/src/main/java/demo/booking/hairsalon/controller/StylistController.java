package demo.booking.hairsalon.controller;

import demo.booking.hairsalon.common.ApiResponse;
import demo.booking.hairsalon.model.dto.response.StylistResponse;
import demo.booking.hairsalon.service.StylistService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/stylists")
public class StylistController {

    private final StylistService stylistService;

    @GetMapping
    public ApiResponse<List<StylistResponse>> getAllStylists() {
        return ApiResponse.success(stylistService.getAllStylists(), "Stylists retrieved successfully", null);
    }

    @GetMapping("/{id}")
    public ApiResponse<StylistResponse> getStylistById(@PathVariable UUID id) {
        return ApiResponse.success(stylistService.getStylistById(id), "Stylist retrieved successfully", null);
    }
}

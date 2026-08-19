package demo.booking.hairsalon.controller;

import demo.booking.hairsalon.common.ApiResponse;
import demo.booking.hairsalon.model.dto.response.ExpertResponse;
import demo.booking.hairsalon.service.ExpertService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/experts")
public class ExpertController {

    private final ExpertService expertService;

    @GetMapping
    public ApiResponse<List<ExpertResponse>> getAllActiveExperts(@RequestParam(required = false) UUID categoryId) {
        if (categoryId != null) {
            return ApiResponse.success(expertService.getExpertsByCategory(categoryId), "Experts retrieved successfully", null);
        }
        return ApiResponse.success(expertService.getAllActiveExperts(), "Experts retrieved successfully", null);
    }

    @GetMapping("/{id}")
    public ApiResponse<ExpertResponse> getExpertById(@PathVariable UUID id) {
        return ApiResponse.success(expertService.getExpertById(id), "Expert retrieved successfully", null);
    }
}

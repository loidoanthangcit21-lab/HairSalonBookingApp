package demo.booking.hairsalon.controller;

import demo.booking.hairsalon.common.ApiResponse;
import demo.booking.hairsalon.model.dto.response.CategoryResponse;
import demo.booking.hairsalon.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ApiResponse<List<CategoryResponse>> getAllActiveCategories() {
        return ApiResponse.success(categoryService.getAllActiveCategories(), "Categories retrieved successfully", null);
    }

    @GetMapping("/{id}")
    public ApiResponse<CategoryResponse> getCategoryById(@PathVariable UUID id) {
        return ApiResponse.success(categoryService.getCategoryById(id), "Category retrieved successfully", null);
    }
}

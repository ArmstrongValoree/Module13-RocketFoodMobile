package com.rocketFoodDelivery.rocketFood.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "restaurants")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Restaurant {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String cuisineType;
    
    @Column(nullable = false)
    private Double rating;
    
    @Column(nullable = false)
    private String imageUrl;
    
    @Column(nullable = false)
    private Integer deliveryTime; // in minutes
    
    @Column(nullable = false)
    private Double deliveryFee;
}

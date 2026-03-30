from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class ExtractedFields(BaseModel):
    name: Optional[str] = None
    style: Optional[str] = None
    abv: Optional[float] = None
    brewery: Optional[str] = None


class DetectionRegion(BaseModel):
    x1: int
    y1: int
    x2: int
    y2: int
    confidence: float = Field(ge=0.0, le=1.0)
    label: str = "label"


class ScanExtraction(BaseModel):
    detected_text: str = ""
    fields: ExtractedFields
    confidence: float = Field(ge=0.0, le=1.0)
    notes: List[str] = Field(default_factory=list)
    regions: List[DetectionRegion] = Field(default_factory=list)


class Recipe(BaseModel):
    id: str
    name: str
    style: str
    abv: Optional[float] = None
    ibu: Optional[float] = None
    description: Optional[str] = None
    ingredients: List[str] = Field(default_factory=list)


class RecipeSuggestion(BaseModel):
    recipe: Recipe
    score: float = Field(ge=0.0, le=1.0)
    match_reasons: List[str] = Field(default_factory=list)


class ScanResponse(BaseModel):
    extraction: ScanExtraction
    recommendations: List[RecipeSuggestion] = Field(default_factory=list)

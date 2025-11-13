import { Component, OnInit } from '@angular/core';
import { TranslationService, LanguageCode } from '../../services/translation.service'; // ✅ استيراد النوع
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss']
})
export class LanguageSelectorComponent implements OnInit {
  currentLanguage: LanguageCode = 'ar'; // ✅ نوع مضبوط

  // 👇 حدّد نوع code صراحةً باش ما يبقاش string عام
  languages: { code: LanguageCode; name: string; flag: string }[] = [
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];

  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    this.translationService.currentLanguage$.subscribe(lang => {
      this.currentLanguage = lang;
    });
  }

  changeLanguage(languageCode: LanguageCode): void {
    this.translationService.setLanguage(languageCode);
  }

  getCurrentLanguageName(): string {
    const lang = this.languages.find(l => l.code === this.currentLanguage);
    return lang ? `${lang.flag} ${lang.name}` : '';
  }
}

// js/config.js - UPDATE DENGAN STRUKTUR DATABASE ANDA
import { supabase } from '../lib/supabase.js'

export const CONFIG = {
    APP_NAME: 'York Heritage Cafe',
    TAX_RATE: 0.05,
    CURRENCY: 'IDR'
}

export const db = {
    // Get all menus - SESUAIKAN DENGAN TABEL ANDA
    async getMenus() {
        try {
            // Query sederhana dulu untuk test
            const { data, error } = await supabase
                .from('menus')
                .select('*')  // Ambil semua dulu, tanpa join
                .eq('is_available', true)
            
            if (error) {
                console.error('Supabase error:', error)
                throw error
            }
            
            console.log('Menu loaded:', data) // Debug: lihat data
            return data
        } catch (error) {
            console.error('Error in getMenus:', error)
            throw error
        }
    },
    
    // Get categories
    async getCategories() {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
            
            if (error) throw error
            return data
        } catch (error) {
            console.error('Error loading categories:', error)
            return []
        }
    }
}
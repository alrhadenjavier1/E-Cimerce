// src/services/authService.ts
import { supabase } from '../lib/supabase';
import { sendConfirmationEmail } from '../lib/emailjs';
import bcrypt from 'bcryptjs';

export interface Account {
  id: string;
  email: string;
  full_name: string;
  is_confirmed: boolean;
  created_at: string;
}

export interface Session {
  account_id: string;
  session_token: string;
  expires_at: string;
}

class AuthService {
  // Generate a 6-digit confirmation code
  generateConfirmationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Hash password
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  // Verify password
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

    async isAdmin(accountId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('role')
        .eq('id', accountId)
        .single();
      
      if (error) throw error;
      return data?.role === 'admin';
    } catch (error) {
      console.error('Admin check error:', error);
      return false;
    }
  }

  // Get current user with role
  async getCurrentUserWithRole(): Promise<{ account: any; isAdmin: boolean }> {
    const sessionToken = localStorage.getItem('session_token');
    if (!sessionToken) {
      return { account: null, isAdmin: false };
    }

    const { data: session, error } = await supabase
      .from('sessions')
      .select('*, accounts(*)')
      .eq('session_token', sessionToken)
      .single();

    if (error || !session || new Date(session.expires_at) < new Date()) {
      await this.logout();
      return { account: null, isAdmin: false };
    }

    const isAdmin = session.accounts.role === 'admin';
    return { account: session.accounts, isAdmin };
  }

  // Log admin action
  async logAdminAction(adminId: string, action: string, entityType?: string, entityId?: string, details?: any) {
    try {
      await supabase
        .from('admin_logs')
        .insert({
          admin_id: adminId,
          action,
          entity_type: entityType,
          entity_id: entityId,
          details,
          ip_address: 'client-side' // In production, get from headers
        });
    } catch (error) {
      console.error('Failed to log admin action:', error);
    }
  }

  // Register new account
  async register(email: string, password: string, fullName: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if email already exists
      const { data: existing, error: checkError } = await supabase
        .from('accounts')
        .select('email')
        .eq('email', email)
        .single();

      if (existing) {
        return { success: false, error: 'Email already registered' };
      }

      // Hash password
      const passwordHash = await this.hashPassword(password);
      
      // Generate confirmation code
      const confirmationCode = this.generateConfirmationCode();
      const confirmationExpiresAt = new Date();
      confirmationExpiresAt.setHours(confirmationExpiresAt.getHours() + 24); // 24 hour expiry

      // Create account
      const { data: account, error: insertError } = await supabase
        .from('accounts')
        .insert({
          email,
          full_name: fullName,
          password_hash: passwordHash,
          confirmation_code: confirmationCode,
          confirmation_expires_at: confirmationExpiresAt.toISOString(),
          is_confirmed: false
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Create empty profile
      await supabase
        .from('profiles')
        .insert({
          id: account.id,
          preferences: {},
          newsletter_subscribed: false
        });

      // Send confirmation email with code
      const emailSent = await sendConfirmationEmail(email, fullName, confirmationCode);
      
      if (!emailSent.success) {
        console.warn('Email sending failed but account created');
      }

      return { success: true };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  }

  // Confirm account with code
  async confirmAccount(email: string, code: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Find account by email and confirmation code
      const { data: account, error: findError } = await supabase
        .from('accounts')
        .select('*')
        .eq('email', email)
        .eq('confirmation_code', code)
        .eq('is_confirmed', false)
        .single();

      if (findError || !account) {
        return { success: false, error: 'Invalid confirmation code' };
      }

      // Check if code expired
      if (new Date(account.confirmation_expires_at) < new Date()) {
        return { success: false, error: 'Confirmation code has expired. Please request a new one.' };
      }

      // Update account as confirmed
      const { error: updateError } = await supabase
        .from('accounts')
        .update({
          is_confirmed: true,
          confirmed_at: new Date().toISOString(),
          confirmation_code: null,
          confirmation_expires_at: null
        })
        .eq('id', account.id);

      if (updateError) throw updateError;

      return { success: true };
    } catch (error: any) {
      console.error('Confirmation error:', error);
      return { success: false, error: error.message };
    }
  }

  // Resend confirmation code
  async resendConfirmationCode(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Find unconfirmed account
      const { data: account, error: findError } = await supabase
        .from('accounts')
        .select('*')
        .eq('email', email)
        .eq('is_confirmed', false)
        .single();

      if (findError || !account) {
        return { success: false, error: 'No unconfirmed account found' };
      }

      // Generate new code
      const newCode = this.generateConfirmationCode();
      const newExpiry = new Date();
      newExpiry.setHours(newExpiry.getHours() + 24);

      // Update code
      const { error: updateError } = await supabase
        .from('accounts')
        .update({
          confirmation_code: newCode,
          confirmation_expires_at: newExpiry.toISOString()
        })
        .eq('id', account.id);

      if (updateError) throw updateError;

      // Send new email
      await sendConfirmationEmail(email, account.full_name, newCode);

      return { success: true };
    } catch (error: any) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }
  }

  // Login
  async login(email: string, password: string): Promise<{ success: boolean; error?: string; account?: any }> {
    try {
      // Find account by email
      const { data: account, error: findError } = await supabase
        .from('accounts')
        .select('*')
        .eq('email', email)
        .single();

      if (findError || !account) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Check if confirmed
      if (!account.is_confirmed) {
        return { success: false, error: 'Please confirm your email before logging in' };
      }

      // Verify password
      const isValid = await this.verifyPassword(password, account.password_hash);
      if (!isValid) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Update last login
      await supabase
        .from('accounts')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', account.id);

      // Create session token (simplified - in production use JWT)
      const sessionToken = this.generateSessionToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      await supabase
        .from('sessions')
        .insert({
          account_id: account.id,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString()
        });

      // Store session in localStorage
      localStorage.setItem('session_token', sessionToken);
      localStorage.setItem('account_id', account.id);
      localStorage.setItem('account_email', account.email);
      localStorage.setItem('account_name', account.full_name);

      return { 
        success: true, 
        account: {
          id: account.id,
          email: account.email,
          full_name: account.full_name
        }
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate session token
  generateSessionToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Logout
  async logout(): Promise<void> {
    const sessionToken = localStorage.getItem('session_token');
    if (sessionToken) {
      await supabase
        .from('sessions')
        .delete()
        .eq('session_token', sessionToken);
    }
    
    localStorage.removeItem('session_token');
    localStorage.removeItem('account_id');
    localStorage.removeItem('account_email');
    localStorage.removeItem('account_name');
  }

  // Get current session
  async getCurrentSession(): Promise<{ account: any | null; isAuthenticated: boolean }> {
    const sessionToken = localStorage.getItem('session_token');
    if (!sessionToken) {
      return { account: null, isAuthenticated: false };
    }

    const { data: session, error } = await supabase
      .from('sessions')
      .select('*, accounts(*)')
      .eq('session_token', sessionToken)
      .single();

    if (error || !session || new Date(session.expires_at) < new Date()) {
      await this.logout();
      return { account: null, isAuthenticated: false };
    }

    return {
      account: session.accounts,
      isAuthenticated: true
    };
  }
}

export const authService = new AuthService();
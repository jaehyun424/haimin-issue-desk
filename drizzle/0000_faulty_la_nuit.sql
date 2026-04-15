CREATE TYPE "public"."activity_type" AS ENUM('bill', 'vote', 'schedule', 'speech', 'office_action', 'press');--> statement-breakpoint
CREATE TYPE "public"."brief_status" AS ENUM('draft', 'review', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."issue_priority" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."issue_status" AS ENUM('new', 'reviewing', 'tracked', 'ready_to_publish', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'editor', 'reviewer', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."source_type" AS ENUM('assembly_api', 'news_api', 'rss', 'manual');--> statement-breakpoint
CREATE TYPE "public"."voice_status" AS ENUM('new', 'screened', 'closed');--> statement-breakpoint
CREATE TYPE "public"."voice_type" AS ENUM('policy_proposal', 'field_report', 'personal_grievance', 'partnership');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "role" DEFAULT 'viewer' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "issue_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "issue_categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "issue_category_links" (
	"issue_id" uuid NOT NULL,
	"category_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "issues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"status" "issue_status" DEFAULT 'new' NOT NULL,
	"priority" "issue_priority" DEFAULT 'medium' NOT NULL,
	"primary_category_id" uuid,
	"owner_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "issues_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "issue_source_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issue_id" uuid NOT NULL,
	"source_document_id" uuid NOT NULL,
	"relevance_score" integer DEFAULT 0 NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "source_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_type" "source_type" NOT NULL,
	"source_name" text NOT NULL,
	"external_id" text,
	"url" text,
	"title" text NOT NULL,
	"body_text" text,
	"published_at" timestamp with time zone,
	"fetched_at" timestamp with time zone NOT NULL,
	"hash" text NOT NULL,
	"language" text DEFAULT 'ko',
	"metadata_json" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "briefs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issue_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"body_md" text NOT NULL,
	"status" "brief_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"last_verified_at" timestamp with time zone,
	"reviewer_user_id" uuid,
	"created_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "briefs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "member_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"activity_type" "activity_type" NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"official_source_url" text,
	"related_issue_id" uuid,
	"metadata_json" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voice_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "voice_type" NOT NULL,
	"category_id" uuid,
	"display_name" text,
	"email" text,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"consent_required" boolean DEFAULT false NOT NULL,
	"consent_optional_contact" boolean DEFAULT false NOT NULL,
	"status" "voice_status" DEFAULT 'new' NOT NULL,
	"assigned_user_id" uuid,
	"related_issue_id" uuid,
	"ip_hash" text,
	"captcha_verdict" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" uuid,
	"action" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text,
	"payload_json" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feature_flags" (
	"key" text PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "issue_category_links" ADD CONSTRAINT "issue_category_links_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_category_links" ADD CONSTRAINT "issue_category_links_category_id_issue_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."issue_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_primary_category_id_issue_categories_id_fk" FOREIGN KEY ("primary_category_id") REFERENCES "public"."issue_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_source_links" ADD CONSTRAINT "issue_source_links_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_source_links" ADD CONSTRAINT "issue_source_links_source_document_id_source_documents_id_fk" FOREIGN KEY ("source_document_id") REFERENCES "public"."source_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "briefs" ADD CONSTRAINT "briefs_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "briefs" ADD CONSTRAINT "briefs_reviewer_user_id_users_id_fk" FOREIGN KEY ("reviewer_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "briefs" ADD CONSTRAINT "briefs_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_activities" ADD CONSTRAINT "member_activities_related_issue_id_issues_id_fk" FOREIGN KEY ("related_issue_id") REFERENCES "public"."issues"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_submissions" ADD CONSTRAINT "voice_submissions_category_id_issue_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."issue_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_submissions" ADD CONSTRAINT "voice_submissions_assigned_user_id_users_id_fk" FOREIGN KEY ("assigned_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_submissions" ADD CONSTRAINT "voice_submissions_related_issue_id_issues_id_fk" FOREIGN KEY ("related_issue_id") REFERENCES "public"."issues"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "issues_status_idx" ON "issues" USING btree ("status");--> statement-breakpoint
CREATE INDEX "issues_category_idx" ON "issues" USING btree ("primary_category_id");--> statement-breakpoint
CREATE INDEX "issue_source_links_issue_idx" ON "issue_source_links" USING btree ("issue_id");--> statement-breakpoint
CREATE INDEX "issue_source_links_source_idx" ON "issue_source_links" USING btree ("source_document_id");--> statement-breakpoint
CREATE INDEX "source_documents_hash_idx" ON "source_documents" USING btree ("hash");--> statement-breakpoint
CREATE INDEX "source_documents_type_idx" ON "source_documents" USING btree ("source_type");--> statement-breakpoint
CREATE INDEX "source_documents_published_idx" ON "source_documents" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "briefs_status_idx" ON "briefs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "briefs_published_idx" ON "briefs" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "briefs_issue_idx" ON "briefs" USING btree ("issue_id");--> statement-breakpoint
CREATE INDEX "member_activities_occurred_idx" ON "member_activities" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "member_activities_type_idx" ON "member_activities" USING btree ("activity_type");--> statement-breakpoint
CREATE INDEX "voice_submissions_status_idx" ON "voice_submissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "voice_submissions_created_idx" ON "voice_submissions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_actor_idx" ON "audit_logs" USING btree ("actor_user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_logs_created_idx" ON "audit_logs" USING btree ("created_at");
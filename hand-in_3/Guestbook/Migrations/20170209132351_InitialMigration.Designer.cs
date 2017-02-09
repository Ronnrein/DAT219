using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Guestbook.Data;

namespace Guestbook.Migrations
{
    [DbContext(typeof(GuestbookContext))]
    [Migration("20170209132351_InitialMigration")]
    partial class InitialMigration
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
            modelBuilder
                .HasAnnotation("ProductVersion", "1.1.0-rtm-22752");

            modelBuilder.Entity("Guestbook.Models.Post", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Author")
                        .IsRequired();

                    b.Property<DateTime>("DateCreated");

                    b.Property<string>("Message")
                        .IsRequired();

                    b.HasKey("Id");

                    b.ToTable("Posts");
                });
        }
    }
}

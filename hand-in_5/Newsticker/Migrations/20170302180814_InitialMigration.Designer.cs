using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Newsticker.Data;

namespace Newsticker.Migrations
{
    [DbContext(typeof(NewstickerContext))]
    [Migration("20170302180814_InitialMigration")]
    partial class InitialMigration
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
            modelBuilder
                .HasAnnotation("ProductVersion", "1.1.0-rtm-22752");

            modelBuilder.Entity("Newsticker.Models.Story", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Content")
                        .IsRequired();

                    b.Property<DateTime>("DateCreated");

                    b.Property<string>("ImageUrl");

                    b.Property<string>("Title")
                        .IsRequired();

                    b.HasKey("Id");

                    b.ToTable("Stories");
                });
        }
    }
}

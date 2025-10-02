package main

import (
	"encoding/csv"
	"fmt"
	"log"
	"os"
	"path"
	"regexp"
	"slices"
	"sort"
	"strconv"
	"strings"
)

const csvPath = "public/docs/EiP.csv"
const outputCsvPath = "./out/authors_and_cities.csv"

// Expected values for title page study corpus
const expectedNumOfRecords = 218
const expectedNumOfUniqueAuthors = 97

func normalizeAuthor(author string) string {
	author = strings.ReplaceAll(author, "(?)", "")
	author = strings.ReplaceAll(author, "?", "")
	author = strings.TrimSpace(author)

	re := regexp.MustCompile(`\s+`)
	parts := re.Split(author, -1)
	var cleaned []string
	for _, p := range parts {
		if p != "" {
			cleaned = append(cleaned, p)
		}
	}
	if len(cleaned) == 1 {
		return author
	}

	separators := []string{
		"de", "la", "del", "della", "di", "da", "do", "dos", "das",
		"du", "van", "von", "der", "den", "ter", "ten", "op",
		"af", "al", "le", "el", "of",
	}

	lowerParts := make([]string, len(cleaned))
	for i, p := range cleaned {
		lowerParts[i] = strings.ToLower(p)
	}

	sepIndex := -1
	for i := 1; i < len(lowerParts); i++ {
		for _, sep := range separators {
			if lowerParts[i] == sep {
				sepIndex = i
				break
			}
		}
		if sepIndex != -1 {
			break
		}
	}

	if sepIndex != -1 {
		lastName := strings.TrimSpace(strings.Join(cleaned[sepIndex:], " "))
		firstNames := strings.TrimSpace(strings.Join(cleaned[:sepIndex], " "))
		return fmt.Sprintf("%s, %s", lastName, firstNames)
	}

	if len(cleaned) < 2 {
		return author
	}
	lastName := cleaned[len(cleaned)-1]
	firstNames := strings.TrimSpace(strings.Join(cleaned[:len(cleaned)-1], " "))
	return fmt.Sprintf("%s, %s", lastName, firstNames)
}

func isInTitlePageStudyCorpus(record map[string]string) bool {
	year, err := strconv.Atoi(record["year"])
	return (err != nil || year <= 1700) &&
		record["language"] != "CHINESE" &&
		record["title"] != "" &&
		record["title"] != "?"
}

func main() {
	records := readCsvFile(csvPath)
	filteredRecords := make([]map[string]string, 0)
	headerToIndex := make(map[string]int)
	for i, header := range records[0] {
		headerToIndex[header] = i
	}
	for _, record := range records[1:] {
		entry := make(map[string]string)
		for header, index := range headerToIndex {
			entry[header] = record[index]
		}
		if isInTitlePageStudyCorpus(entry) {
			filteredRecords = append(filteredRecords, entry)
		}
	}

	if len(filteredRecords) != expectedNumOfRecords {
		log.Fatal("Unexpected number of filtered records: ", len(filteredRecords))
	}

	authorToCities := make(map[string][]string)

	for _, record := range filteredRecords {
		authors := make([]string, 0)
		for _, author := range strings.Split(record["author (normalized)"], ", ") {
			authors = append(authors, normalizeAuthor(author))
		}
		cities := []string{record["city"], record["city2"]}
		for _, author := range authors {
			for _, city := range cities {
				if city != "" && !slices.Contains(authorToCities[author], city) {
					authorToCities[author] = append(authorToCities[author], city)
				}
			}
		}
	}

	if len(authorToCities) != expectedNumOfUniqueAuthors {
		log.Fatal("Unexpected number of unique authors: ", len(authorToCities))
	}

	authorsSortedByNumCities := make([]string, 0, len(authorToCities))
	for author := range authorToCities {
		authorsSortedByNumCities = append(authorsSortedByNumCities, author)
	}

	sort.Slice(authorsSortedByNumCities, func(i, j int) bool {
		if len(authorToCities[authorsSortedByNumCities[i]]) == len(authorToCities[authorsSortedByNumCities[j]]) {
			return strings.Compare(authorsSortedByNumCities[i], authorsSortedByNumCities[j]) < 0
		}
		return len(authorToCities[authorsSortedByNumCities[i]]) > len(authorToCities[authorsSortedByNumCities[j]])
	})

	for _, author := range authorsSortedByNumCities {
		log.Printf("%s (%d): %s\n", author, len(authorToCities[author]), strings.Join(authorToCities[author], ", "))
	}

	outputRecords := [][]string{{"author", "num_cities", "cities"}}
	for _, author := range authorsSortedByNumCities {
		cities := authorToCities[author]
		sort.Strings(cities)
		outputRecords = append(outputRecords, []string{author, strconv.Itoa(len(cities)), strings.Join(cities, ", ")})
	}

	writeToCsvFile(outputCsvPath, outputRecords)

	log.Printf("Wrote %d authors and their cities to %s\n", len(outputRecords)-1, outputCsvPath)
}

func writeToCsvFile(filePath string, records [][]string) {
	if err := os.MkdirAll(path.Dir(filePath), os.ModePerm); err != nil {
		log.Fatal("Unable to create output directory for "+filePath, err)
	}
	f, err := os.Create(filePath)
	if err != nil {
		log.Fatal("Unable to create output file "+filePath, err)
	}
	defer f.Close()

	csvWriter := csv.NewWriter(f)
	defer csvWriter.Flush()

	for _, record := range records {
		if err := csvWriter.Write(record); err != nil {
			log.Fatal("Unable to write record to file "+filePath, err)
		}
	}
}

func readCsvFile(filePath string) [][]string {
	f, err := os.Open(filePath)
	if err != nil {
		log.Fatal("Unable to read input file "+filePath, err)
	}
	defer f.Close()

	csvReader := csv.NewReader(f)
	records, err := csvReader.ReadAll()
	if err != nil {
		log.Fatal("Unable to parse file as CSV for "+filePath, err)
	}

	return records
}
